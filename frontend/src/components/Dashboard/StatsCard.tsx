interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

const colorClasses = {
  blue: 'from-blue-600 to-blue-800',
  green: 'from-green-600 to-green-800',
  red: 'from-red-600 to-red-800',
  yellow: 'from-yellow-600 to-yellow-800',
};

export function StatsCard({ title, value, icon, color = 'blue' }: StatsCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-200 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-5xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}
