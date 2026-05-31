import * as Icons from 'lucide-react';

export default function Icon({ name, size = 14, className = "" }: { name: string, size?: number, className?: string }) {
  const LucideIcon = (Icons as any)[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} />;
}
