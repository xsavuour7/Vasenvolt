import { useMemo, useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { MetricsResponse } from '../api/metrics'

interface ConsumptionChartProps {
  data: MetricsResponse | undefined
  isLoading?: boolean
  error?: string | null
}

/**
 * Line chart component displaying kWh consumption over time using ECharts
 */
export default function ConsumptionChart({
  data,
  isLoading = false,
  error = null,
}: ConsumptionChartProps) {
  // Format timestamp based on time range
  const formatTimestamp = (timestamp: string, range: string): string => {
    const date = new Date(timestamp)
    
    if (range.includes('h')) {
      // For hourly ranges, show hour and minute
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } else if (range.includes('d')) {
      // For daily ranges, show date and time
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    }
    
    // Default format
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

   // Get theme colors
   const [themeColors] = useState({
    foreground: '#0f172a',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
    primary: '#0f172a',
    card: '#ffffff',
  })

  useEffect(() => {
    // Get computed colors from CSS variables
    const getColor = (varName: string, fallback: string) => {
      if (typeof window === 'undefined') return fallback
      const style = getComputedStyle(document.documentElement)
      const value = style.getPropertyValue(varName).trim()
      // CSS variables are HSL format, so we'll use a simpler approach
      // For now, use fallback colors that work with the theme
      return value || fallback
    }
    setthemeColors ({
      foreground: getColor('--foreground', '#0f172a'),
      mutedForeground: getColor('--muted-foreground', '#64748b'),
      border: getColor('--border', '#e2e8f0'),
      primary: getColor('--primary', '#0f172a'),
      card: getColor('--card', '#ffffff'),
    });
    

    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark')
    
    sethemeColors ({
      foreground: isDark ? '#f1f5f9' : '#0f172a',
      mutedForeground: isDark ? '#94a3b8' : '#64748b',
      border: isDark ? '#334155' : '#e2e8f0',
      primary: isDark ? '#f1f5f9' : '#0f172a',
      card: isDark ? '#1e293b' : '#ffffff',
    })
  }, [])

  // Prepare chart data
  const chartOption = useMemo(() => {
    if (!data || data.data.length === 0) {
      return null
    }

    // Extract timestamps and kWh values
    const timestamps = data.data.map((point) => point.timestamp)
    const kwhValues = data.data.map((point) => point.kwh ?? 0)

    // Format timestamps for x-axis
    const formattedTimestamps = timestamps.map((ts) =>
      formatTimestamp(ts, data.range)
    )

    return {
      title: {
        text: 'Energy Consumption Over Time',
        left: 'center',
        textStyle: {
          color: themeColors.foreground,
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
        borderWidth: 1,
        textStyle: {
          color: themeColors.foreground,
        },
        formatter: (params: tooltip) => {
          const param = params[0]
          const originalTimestamp = timestamps[param.dataIndex]
          const date = new Date(originalTimestamp)
          const formattedDate = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
          return `
            <div style="margin-bottom: 4px;">
              <strong>${formattedDate}</strong>
            </div>
            <div>
              ${param.seriesName}: <strong>${param.value.toFixed(2)} kWh</strong>
            </div>
          `
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: themeColors.primary,
            width: 1,
            type: 'dashed',
          },
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: formattedTimestamps,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: themeColors.border,
          },
        },
        axisLabel: {
          color: themeColors.mutedForeground,
          rotate: data.range.includes('d') ? 45 : 0,
          formatter: (value: string) => {
            // Truncate long labels for better display
            if (value.length > 10) {
              return value.substring(0, 10) + '...'
            }
            return value
          },
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: 'kWh',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: themeColors.mutedForeground,
        },
        axisLine: {
          lineStyle: {
            color: themeColors.border,
          },
        },
        axisLabel: {
          color: themeColors.mutedForeground,
          formatter: '{value}',
        },
        splitLine: {
          lineStyle: {
            color: themeColors.border,
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Energy Consumption',
          type: 'line',
          data: kwhValues,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: themeColors.primary,
            width: 2,
          },
          itemStyle: {
            color: themeColors.primary,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: themeColors.primary,
                  opacity: 0.3,
                },
                {
                  offset: 1,
                  color: themeColors.primary,
                  opacity: 0.05,
                },
              ],
            },
          },
        },
      ],
      animation: true,
      animationDuration: 750,
    }
  }, [data, themeColors])

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 shadow-sm">
        <p className="text-sm text-destructive text-center">
          {error || 'Error loading chart data'}
        </p>
      </div>
    )
  }

  // No data state
  if (!data || data.data.length === 0 || !chartOption) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground text-center py-8">
          No chart data available for the selected time range
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <ReactECharts
        option={chartOption}
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}

