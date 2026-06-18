import { Card, CardContent } from './ui/card';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  trend,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            {trend && (
              <p
                className={`text-xs mt-2 ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          <div
            className={`w-14 h-14 rounded-lg flex items-center justify-center ${iconBgColor}`}
          >
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
