import {
  Moon, Mail, Flame, BadgeCheck, Handshake,
  Shield, BarChart3, Sunset, TrendingUp, Search,
  Users, Rocket, CalendarDays, Zap, MessageSquare,
  User, Home, BookOpen, Megaphone, Settings,
  HelpCircle, Send, ChevronDown, ChevronUp, Plus,
  Pencil, Trash2, Eye, Phone, Inbox, Check, X,
  FileText, Clock, MousePointerClick, Info,
  AlertTriangle, ArrowRight, Copy, Sparkles,
  type LucideProps,
} from 'lucide-react';
import { type FC } from 'react';

const ICONS: Record<string, FC<LucideProps>> = {
  moon: Moon,
  mail: Mail,
  flame: Flame,
  'badge-check': BadgeCheck,
  handshake: Handshake,
  shield: Shield,
  'bar-chart': BarChart3,
  sunset: Sunset,
  'trending-up': TrendingUp,
  search: Search,
  users: Users,
  rocket: Rocket,
  calendar: CalendarDays,
  zap: Zap,
  'message-square': MessageSquare,
  user: User,
  home: Home,
  'book-open': BookOpen,
  megaphone: Megaphone,
  settings: Settings,
  'help-circle': HelpCircle,
  send: Send,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  plus: Plus,
  pencil: Pencil,
  trash: Trash2,
  eye: Eye,
  phone: Phone,
  inbox: Inbox,
  check: Check,
  x: X,
  'file-text': FileText,
  clock: Clock,
  'mouse-click': MousePointerClick,
  info: Info,
  'alert-triangle': AlertTriangle,
  'arrow-right': ArrowRight,
  copy: Copy,
  sparkles: Sparkles,
};

export function Icon({
  name,
  className,
  size,
  strokeWidth,
  ...props
}: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
} & Omit<LucideProps, 'ref'>) {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;
  return <IconComponent className={className || 'w-4 h-4'} size={size} strokeWidth={strokeWidth ?? 1.75} {...props} />;
}
