import { calculatePercentageChange } from '../utils/metricsCalculations'

interface KPICardProps {
  title: string
  currentValue: number
  previousValue: number | null
  unit?: string
  formatValue?: (value: number) => string
  isIncreaseGood?: boolean // For consumption, increase is bad (false), for other metrics might be good
}

/**
 * Individual KPI Card component displaying a metric with period-over-period comparison
 */
export default function KPICard({
  title,
  currentValue,
  previousValue,
  unit = '',
  formatValue,
  isIncreaseGood = false,
}: KPICardProps) {
  // Format the value
  const format = formatValue || ((val: number) => val.toFixed(2))
  const formattedValue = format(currentValue)

  // Calculate percentage change if we have previous value
  const hasComparison = previousValue !== null && previousValue !== undefined
  const percentageChange = hasComparison
    ? calculatePercentageChange(currentValue, previousValue)
    : null

  // Determine if change is positive/negative and good/bad
  const isIncrease = percentageChange !== null && percentageChange > 0
  const isDecrease = percentageChange !== null && percentageChange < 0
  const isGoodChange = isIncreaseGood ? isIncrease : isDecrease
  const isBadChange = isIncreaseGood ? isDecrease : isIncrease

  // Color coding: green for good change, red for bad change
  const changeColorClass = isGoodChange
    ? 'text-green-600 dark:text-green-400'
    : isBadChange
    ? 'text-red-600 dark:text-red-400'
    : 'text-muted-foreground'

  const changeIcon = isIncrease ? '↑' : isDecrease ? '↓' : ''

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-card-foreground">
          {formattedValue}
        </p>
        {unit && (
          <span className="text-lg text-muted-foreground">{unit}</span>
        )}
      </div>
      
      {hasComparison && percentageChange !== null && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`text-sm font-medium ${changeColorClass}`}>
            {changeIcon} {Math.abs(percentageChange).toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">
            vs previous period
          </span>
        </div>
      )}
      
      {!hasComparison && (
        <div className="mt-3">
          <span className="text-xs text-muted-foreground">
            No comparison data available
          </span>
        </div>
      )}
    </div>
  )
}


