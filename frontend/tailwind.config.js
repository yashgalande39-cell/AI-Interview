/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Base Surfaces ──
        bg: {
          DEFAULT: '#080C14',
          2: '#0D1220',
          3: '#111827',
          4: '#151E30',
        },
        surface: {
          DEFAULT: '#111827',
          2: '#1A2235',
          3: '#1E2A40',
          4: '#243050',
          border: 'rgba(255,255,255,0.06)',
          'border-hover': 'rgba(99,102,241,0.4)',
        },

        // ── Brand Accents ──
        brand: {
          blue:   '#3B82F6',
          violet: '#8B5CF6',
          cyan:   '#06B6D4',
          indigo: '#6366F1',
        },

        // ── Semantic ──
        success: { DEFAULT: '#10B981', muted: 'rgba(16,185,129,0.12)', glow: 'rgba(16,185,129,0.3)' },
        warning: { DEFAULT: '#F59E0B', muted: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.3)' },
        danger:  { DEFAULT: '#EF4444', muted: 'rgba(239,68,68,0.12)',  glow: 'rgba(239,68,68,0.3)' },
        info:    { DEFAULT: '#60A5FA', muted: 'rgba(96,165,250,0.12)', glow: 'rgba(96,165,250,0.3)' },

        // ── Text Hierarchy ──
        tx: {
          primary:   '#F1F5F9',
          secondary: '#94A3B8',
          muted:     '#64748B',
          disabled:  '#475569',
          inverse:   '#0F172A',
        },

        // Legacy aliases for backward compat
        darkBg: '#080C14',
        darkPanel: 'rgba(13,18,32,0.65)',
        accentViolet: '#8B5CF6',
        accentCyan: '#06B6D4',
        accentPink: '#EC4899',
        accentEmerald: '#10B981',
        'brand-dark': '#0D1220',
        'brand-card': '#111827',
      },

      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'hero':  ['clamp(3rem,6vw,4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h1':    ['clamp(2rem,4vw,2.5rem)',  { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2':    ['1.5rem',                   { lineHeight: '1.25', letterSpacing: '-0.02em',  fontWeight: '600' }],
        'h3':    ['1.125rem',                 { lineHeight: '1.4',  letterSpacing: '-0.01em',  fontWeight: '600' }],
        'label': ['0.6875rem',                { lineHeight: '1.4',  letterSpacing: '0.06em',   fontWeight: '500' }],
      },

      boxShadow: {
        'sm':          '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'md':          '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
        'lg':          '0 10px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
        'xl':          '0 24px 64px rgba(0,0,0,0.7)',
        'card':        '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 0 0 1px rgba(99,102,241,0.35), 0 8px 32px rgba(0,0,0,0.5)',
        'glow-blue':   '0 0 20px rgba(59,130,246,0.25), 0 0 60px rgba(59,130,246,0.1)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.1)',
        'glow-cyan':   '0 0 20px rgba(6,182,212,0.25),  0 0 60px rgba(6,182,212,0.1)',
        'glow-sm':     '0 0 10px rgba(139,92,246,0.15)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
      },

      backgroundImage: {
        'gradient-blue-violet':  'linear-gradient(135deg, #3B82F6, #8B5CF6)',
        'gradient-violet-cyan':  'linear-gradient(135deg, #8B5CF6, #06B6D4)',
        'gradient-cyan-indigo':  'linear-gradient(135deg, #06B6D4, #6366F1)',
        'gradient-blue-indigo':  'linear-gradient(135deg, #3B82F6, #6366F1)',
        'gradient-radial-violet':'radial-gradient(ellipse at center, rgba(139,92,246,0.2) 0%, transparent 70%)',
        'gradient-radial-blue':  'radial-gradient(ellipse at center, rgba(59,130,246,0.2) 0%, transparent 70%)',
        'grid-pattern':          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        'dot-pattern':           'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      },

      backgroundSize: {
        'grid': '40px 40px',
        'dot':  '24px 24px',
      },

      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },

      transitionTimingFunction: {
        'spring':  'cubic-bezier(0.22, 1, 0.36, 1)',
        'smooth':  'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
      },

      animation: {
        'shimmer':      'shimmer 2s linear infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 10s ease-in-out infinite',
        'glow-pulse':   'glow-pulse 2s ease-in-out infinite alternate',
        'fade-in':      'fade-in 0.3s ease-out forwards',
        'slide-up':     'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-down':   'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in':     'scale-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'spin-slow':    'spin 8s linear infinite',
        'orbit':        'orbit 12s linear infinite',
        'sound-bar-1':  'sound 474ms -800ms linear infinite alternate',
        'sound-bar-2':  'sound 433ms -800ms linear infinite alternate',
        'sound-bar-3':  'sound 407ms -800ms linear infinite alternate',
        'sound-bar-4':  'sound 458ms -800ms linear infinite alternate',
        'sound-bar-5':  'sound 400ms -800ms linear infinite alternate',
        'sound-bar-6':  'sound 427ms -800ms linear infinite alternate',
        'typing-dot':   'typing-dot 1.2s ease-in-out infinite',
        'recording-dot':'recording-dot 1s ease-in-out infinite',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%':   { boxShadow: '0 0 10px rgba(139,92,246,0.15)' },
          '100%': { boxShadow: '0 0 30px rgba(139,92,246,0.4)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
        },
        sound: {
          '0%':   { height: '4px', opacity: '0.5' },
          '100%': { height: '24px', opacity: '1' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { opacity: '0.2', transform: 'translateY(0)' },
          '30%':           { opacity: '1',   transform: 'translateY(-4px)' },
        },
        'recording-dot': {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)' },
          '50%':       { opacity: '0.3', transform: 'scale(0.8)' },
        },
      },

      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '68':  '17rem',
        '72':  '18rem',
        '76':  '19rem',
        '80':  '20rem',
        '88':  '22rem',
        '96':  '24rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
