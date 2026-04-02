interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-sce-orange/20 transition-all duration-300 group">
      <div className="w-14 h-14 bg-sce-orange/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-sce-orange/20 transition-colors">
        <span className="text-sce-orange">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-sce-navy mb-3">{title}</h3>
      <p className="text-sce-gray leading-relaxed">{description}</p>
    </div>
  );
}
