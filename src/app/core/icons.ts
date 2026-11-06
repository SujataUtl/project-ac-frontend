import { Component, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import {
  Activity, ArrowRight, Award, Banknote, Bot, BookOpen, Boxes, BrainCircuit, Building2, Cable, Car, ChartColumn, Check,
  Clock, Cloud, CloudUpload, Code, CodeXml, Cpu, Database, Eye, Factory, Gauge, Globe, GraduationCap, Handshake,
  HeartPulse, Home, Hospital, Landmark, Layers, LayoutDashboard, Leaf, LifeBuoy, Lightbulb, Lock, Mail, MapPin,
  MessageCircle, MonitorSmartphone, Network, PenTool, Phone, Plane, Plug, Radio, RefreshCw, Rocket, Search, Send,
  Server, Settings, ShieldCheck, ShoppingCart, Smartphone, Sparkles, Store, Target, TestTube, Truck, Users, Wifi,
  Workflow, Wrench, Zap,
  type IconNode,
} from 'lucide';

const Linkedin: IconNode = [
  ['path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' }],
  ['rect', { width: 4, height: 12, x: 2, y: 9 }],
  ['circle', { cx: 4, cy: 4, r: 2 }],
];

/** Icon library available on the site and in the admin icon picker (kebab-case names). */
export const ICONS: Record<string, IconNode> = {
  smartphone: Smartphone, 'monitor-smartphone': MonitorSmartphone, code: Code, 'code-xml': CodeXml, radio: Radio, wifi: Wifi,
  cloud: Cloud, 'cloud-upload': CloudUpload, bot: Bot, 'brain-circuit': BrainCircuit, cable: Cable, plug: Plug, server: Server,
  settings: Settings, layers: Layers, workflow: Workflow, cpu: Cpu, database: Database, network: Network, boxes: Boxes,
  'layout-dashboard': LayoutDashboard, globe: Globe, 'heart-pulse': HeartPulse, hospital: Hospital, factory: Factory,
  truck: Truck, 'shopping-cart': ShoppingCart, store: Store, 'graduation-cap': GraduationCap, building: Building2, home: Home,
  landmark: Landmark, leaf: Leaf, plane: Plane, car: Car, banknote: Banknote, users: Users, 'shield-check': ShieldCheck,
  lock: Lock, rocket: Rocket, 'refresh-cw': RefreshCw, zap: Zap, gauge: Gauge, 'life-buoy': LifeBuoy, award: Award,
  eye: Eye, target: Target, 'book-open': BookOpen, handshake: Handshake, lightbulb: Lightbulb, search: Search,
  'pen-tool': PenTool, 'test-tube': TestTube, wrench: Wrench, activity: Activity, chart: ChartColumn, sparkles: Sparkles,
  mail: Mail, phone: Phone, 'map-pin': MapPin, linkedin: Linkedin, 'message-circle': MessageCircle, send: Send,
  clock: Clock, check: Check, 'arrow-right': ArrowRight,
};

export const ICON_NAMES = Object.keys(ICONS);

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Renders a named icon as inline SVG. Unknown names (e.g. legacy emoji values) are rendered as plain text,
 * so content typed into the admin panel always shows something.
 */
@Component({
  selector: 'app-icon',
  template: '',
  styles: ':host { display: inline-flex; align-items: center; justify-content: center; line-height: 1; } :host ::ng-deep svg { width: 100%; height: 100%; }',
  host: { ngSkipHydration: 'true', 'aria-hidden': 'true', '[style.width.px]': 'size()', '[style.height.px]': 'size()', '[style.font-size.px]': 'size() * 0.9' },
})
export class Icon {
  name = input<string | null | undefined>('');
  size = input(24);
  stroke = input(1.75);

  private el = inject(ElementRef<HTMLElement>);
  private r = inject(Renderer2);

  constructor() {
    effect(() => {
      const host = this.el.nativeElement as HTMLElement;
      while (host.firstChild) host.removeChild(host.firstChild);
      const name = (this.name() || '').trim();
      const node = ICONS[name];
      if (!node) {
        if (name) this.r.appendChild(host, this.r.createText(name));
        return;
      }
      const svg = this.r.createElement('svg', 'svg') as SVGElement;
      const attrs: Record<string, string> = {
        xmlns: SVG_NS, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        'stroke-width': String(this.stroke()), 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      };
      for (const [k, v] of Object.entries(attrs)) this.r.setAttribute(svg, k, v);
      for (const [tag, a] of node) {
        const child = this.r.createElement(tag, 'svg');
        for (const [k, v] of Object.entries(a)) if (v != null) this.r.setAttribute(child, k, String(v));
        this.r.appendChild(svg, child);
      }
      this.r.appendChild(host, svg);
    });
  }
}
