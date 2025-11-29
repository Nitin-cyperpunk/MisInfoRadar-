 'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin } from 'lucide-react'
import { useRefresh } from '@/components/providers/RefreshProvider'
import { sampleContentItems } from '@/lib/sample-data'

type RegionalFocus = {
  region: string
  signal: string
  confidence: string
  status: 'critical' | 'high' | 'medium' | 'low'
}

const STATE_OPTIONS = [
  'All',
  'Maharashtra',
  'Mumbai',
  'Pune',
  'Nagpur',
  'Kolhapur',
  'Satara',
  'Thane',
  'Aurangabad',
]

export function DynamicRegionalFocus() {
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (error) {
      return undefined
    }
  }, [])
  
  const [regions, setRegions] = useState<RegionalFocus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState<string>('All')
  const { refreshToken } = useRefresh()
  
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    loadRegionalFocus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, refreshToken])
  
  async function loadRegionalFocus() {
    if (!supabase) return
    
    try {
      setLoading(true)
      
      // Get alerts with geographic information
      const { data: alerts } = await supabase
        .from('alerts')
        .select('id, title, message, severity, alert_type, content_id, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (!alerts || alerts.length === 0) {
        setRegions([])
        return
      }
      
      // Get content items for these alerts to extract regions
      const contentIds = alerts.map(a => a.content_id).filter(Boolean)
      let contentMap: Record<string, any> = {}
      
      if (contentIds.length > 0) {
        const { data: contentItems } = await supabase
          .from('content_items')
          .select('id, title, keywords, geographic_spread, misinformation_confidence')
          .in('id', contentIds)
        
        if (contentItems) {
          contentMap = Object.fromEntries(
            contentItems.map(item => [item.id, item])
          )
        }
      }
      
      // Get source traces for geographic spread
      const { data: traces } = await supabase
        .from('source_traces')
        .select('content_id, geographic_spread, spread_pattern')
        .in('content_id', contentIds)
      
      const traceMap: Record<string, any> = {}
      if (traces) {
        traces.forEach(trace => {
          if (trace.content_id) {
            traceMap[trace.content_id] = trace
          }
        })
      }
      
      // Extract regions from alerts and content
      const regionMap: Record<string, { alerts: any[]; maxSeverity: string }> = {}
      
      alerts.forEach(alert => {
        const content = contentMap[alert.content_id]
        const trace = traceMap[alert.content_id]
        
        // Try to extract region from geographic_spread, keywords, or default
        let region = 'Maharashtra'
        
        if (trace?.geographic_spread && Array.isArray(trace.geographic_spread) && trace.geographic_spread.length > 0) {
          region = trace.geographic_spread[0].region || region
        } else if (content?.keywords && Array.isArray(content.keywords)) {
          // Look for city names in keywords
          const cityKeywords = ['Mumbai', 'Pune', 'Nagpur', 'Kolhapur', 'Satara', 'Thane', 'Aurangabad']
          const foundCity = content.keywords.find((k: string) => 
            cityKeywords.some(city => k.toLowerCase().includes(city.toLowerCase()))
          )
          if (foundCity) {
            region = foundCity
          }
        }
        
        if (!regionMap[region]) {
          regionMap[region] = { alerts: [], maxSeverity: 'low' }
        }
        
        regionMap[region].alerts.push(alert)
        
        // Update max severity
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        if (severityOrder[alert.severity as keyof typeof severityOrder] > 
            severityOrder[regionMap[region].maxSeverity as keyof typeof severityOrder]) {
          regionMap[region].maxSeverity = alert.severity
        }
      })
      
      // Convert to array
      const regionArray: RegionalFocus[] = Object.entries(regionMap)
        .map(([region, data]) => {
          const alert = data.alerts[0]
          const content = contentMap[alert.content_id]
          const trace = traceMap[alert.content_id]
          
          let signal = alert.title || 'Misinformation detected'
          if (trace?.spread_pattern === 'bot_amplified') {
            signal = `Bot amplification: ${signal}`
          } else if (trace?.spread_pattern === 'coordinated') {
            signal = `Coordinated campaign: ${signal}`
          } else if (alert.alert_type === 'deepfake') {
            signal = `Deepfake: ${signal}`
          }
          
          // Calculate confidence from alert or content
          const confidence = alert.content_id && content
            ? (content.misinformation_confidence || 0.5).toFixed(2)
            : '0.50'
          
          return {
            region,
            signal: signal.length > 60 ? signal.substring(0, 60) + '...' : signal,
            confidence,
            status: data.maxSeverity as 'critical' | 'high' | 'medium' | 'low',
          }
        })
        .sort((a, b) => {
          const order = { critical: 4, high: 3, medium: 2, low: 1 }
          return order[b.status] - order[a.status]
        })
        .slice(0, 8)
      
      setRegions(regionArray)
    } catch (error) {
      console.error('Error loading regional focus:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const hasLiveRegions = regions.length > 0
  
  // Fallback when there are no live regions: use sample content items by state
  const fallbackRegions: RegionalFocus[] = !hasLiveRegions
    ? sampleContentItems
        .filter(item => item.is_misinformation)
        .map(item => {
          const text = `${item.title} ${item.description || ''}`
          const cities = ['Mumbai', 'Pune', 'Nagpur', 'Kolhapur', 'Satara', 'Thane', 'Aurangabad']
          const foundCity = cities.find(city => text.toLowerCase().includes(city.toLowerCase()))
          const region = foundCity || 'Maharashtra'
          
          return {
            region,
            signal: item.title,
            confidence: (item.misinformation_confidence || 0.5).toFixed(2),
            status: (item.severity_level as 'critical' | 'high' | 'medium' | 'low') || 'medium',
          }
        })
    : []
  
  const allRegions = hasLiveRegions ? regions : fallbackRegions
  
  const filteredRegions =
    selectedState === 'All'
      ? allRegions
      : allRegions.filter(r =>
          r.region.toLowerCase().includes(selectedState.toLowerCase())
        )
  
  if (loading && allRegions.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-white/10 rounded w-32"></div>
              <div className="h-6 bg-white/10 rounded w-20"></div>
            </div>
            <div className="h-4 bg-white/10 rounded w-full mb-1"></div>
            <div className="h-3 bg-white/10 rounded w-24"></div>
          </div>
        ))}
      </div>
    )
  }
  
  if (!loading && filteredRegions.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8 text-sm">
        No regional news found for this selection.
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
        <span className="uppercase tracking-[0.3em] text-slate-400">Region Filter</span>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-slate-100 outline-none focus:border-white/40"
        >
          {STATE_OPTIONS.map(state => (
            <option key={state} value={state}>
              {state === 'All' ? 'All Regions' : state}
            </option>
          ))}
        </select>
      </div>
      
      {filteredRegions.map((region, idx) => (
        <div key={`${region.region}-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="font-medium">{region.region}</span>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs ${
                region.status === 'critical'
                  ? 'bg-red-500/20 text-red-200'
                  : region.status === 'high'
                  ? 'bg-orange-500/20 text-orange-200'
                  : region.status === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-200'
                  : 'bg-blue-500/20 text-blue-200'
              }`}
            >
              {region.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-200">{region.signal}</p>
          <p className="text-xs text-slate-400">Confidence {region.confidence}</p>
        </div>
      ))}
    </div>
  )
}

