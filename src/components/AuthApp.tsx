import React, { useCallback, useEffect, useState } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { ptPT } from '@clerk/localizations';
import { shadcn } from '@clerk/themes';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import App from '../App';
import { UserOnboarding } from './UserOnboarding';
import type { ApoloUserProfile } from '../types';

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Falta a chave pública de autenticação do APOLO.');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: 'top' as const,
    socialButtonsVariant: 'blockButton' as const,
  },
  variables: {
    colorPrimary: '#0877ed',
    colorForeground: '#e4edff',
    colorMutedForeground: '#9aacc9',
    colorDanger: '#fb7185',
    colorBackground: '#061329',
    colorInput: '#071329',
    colorInputForeground: '#e2edff',
    colorNeutral: '#e4edff',
    fontFamily: "'Space Grotesk', 'DM Sans', ui-sans-serif, system-ui, sans-serif",
    borderRadius: '0.65rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#061329] border border-[#1d5cb0]/60 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,.5)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-semibold tracking-tight text-[#f0f5ff]',
    headerSubtitle: 'text-[#9aacc9]',
    socialButtonsBlockButtonText: 'font-semibold text-[#dce9ff]',
    formFieldLabel: 'text-[#b8c9e6]',
    footerActionLink: 'font-semibold text-[#48a4ff]',
    footerActionText: 'text-[#9aacc9]',
    dividerText: 'text-[#9aacc9]',
    identityPreviewEditButton: 'text-[#48a4ff]',
    formFieldSuccessText: 'text-emerald-300',
    alertText: 'text-rose-200',
    logoBox: 'mb-2',
    logoImage: 'h-10 w-10',
    socialButtonsBlockButton: 'border border-[#1e3b67] bg-[#071329] hover:bg-[#0b1e3b]',
    formButtonPrimary: 'bg-[#0877ed] text-white hover:bg-[#1688ff]',
    formFieldInput: 'border-[#1e3b67] bg-[#071329] text-[#e2edff]',
    footerAction: 'border-t border-[#19345a]',
    dividerLine: 'bg-[#203d67]',
    alert: 'border border-rose-500/30 bg-rose-950/40',
    otpCodeFieldInput: 'border-[#1e3b67] bg-[#071329] text-[#e2edff]',
    formFieldRow: 'text-[#b8c9e6]',
    main: 'gap-5',
  },
};

function LoadingScreen({ message = 'A preparar a tua conta...' }: { message?: string }) {
  return (
    <main className="apolo-auth-page flex min-h-[100dvh] items-center justify-center px-5 text-[#e4edff]">
      <div role="status" className="flex items-center gap-3 border border-blue-500/30 bg-[#061329]/90 px-5 py-4 text-sm text-blue-100">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400 shadow-[0_0_12px_#1684ff]" />
        {message}
      </div>
    </main>
  );
}

function PublicHome() {
  return (
    <main className="apolo-auth-page relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-12 text-[#e4edff]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(61,121,209,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(61,121,209,.12)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_82%)]" />
      <section className="relative w-full max-w-4xl border border-blue-500/40 bg-[#061329]/85 p-7 shadow-[0_28px_90px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-12">
        <div className="mb-8 flex items-center gap-3">
          <img src={`${basePath}/logo.svg`} alt="" className="h-12 w-12" />
          <div>
            <p className="text-sm font-black tracking-[0.22em] text-white">APOLO<span className="text-blue-400">.IA</span></p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.18em] text-blue-200/60">ASSISTENTE PESSOAL INTELIGENTE</p>
          </div>
          <span className="ml-auto hidden items-center gap-2 border border-blue-500/20 bg-blue-500/5 px-3 py-2 font-mono text-[9px] tracking-widest text-blue-200/75 sm:flex">
            <LockKeyhole className="h-3.5 w-3.5 text-blue-400" />
            ACESSO PROTEGIDO
          </span>
        </div>

        <div className="max-w-2xl">
          <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.22em] text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            A TUA CONTA, A TUA EXPERIÊNCIA
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl">
            A tua central de <span className="text-blue-400">inteligência.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Acede ao APOLO para falar com o assistente, gerir ferramentas e guardar as tuas preferências na tua conta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className="inline-flex min-h-12 items-center justify-center gap-2 border border-blue-400 bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-500">
              Criar conta <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sign-in" className="inline-flex min-h-12 items-center justify-center border border-blue-900 bg-[#071329] px-6 text-sm font-semibold text-blue-100 transition-colors hover:border-blue-500/60 hover:bg-[#0b1e3b]">
              Iniciar sessão
            </Link>
          </div>
        </div>
        <div className="mt-12 border-t border-blue-900/70 pt-5 font-mono text-[9px] tracking-[0.16em] text-slate-500">
          CONTA APOLO · PERFIL E PREFERÊNCIAS SINCRONIZADOS
        </div>
      </section>
    </main>
  );
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  return isSignedIn ? <Redirect to="/user-portal" /> : <PublicHome />;
}

function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="apolo-auth-page flex min-h-[100dvh] items-center justify-center overflow-y-auto px-4 py-8 text-[#e4edff]">
      <div className="w-full">
        <div className="mx-auto mb-5 max-w-[440px] border-l-2 border-blue-500 pl-3">
          <p className="font-mono text-[9px] tracking-[0.2em] text-blue-400">APOLO · ACESSO À CONTA</p>
          <p className="mt-1 text-xs text-slate-400">Acede em segurança à tua experiência APOLO.</p>
        </div>
        {children}
        <div className="mx-auto mt-5 max-w-[440px] text-center text-xs text-slate-500">
          <Link href="/" className="text-blue-300 hover:text-blue-200">Voltar à página inicial</Link>
        </div>
      </div>
    </main>
  );
}

function SignInRoute() {
  return (
    <AuthPage>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        forceRedirectUrl={`${basePath}/user-portal`}
      />
    </AuthPage>
  );
}

function SignUpRoute() {
  return (
    <AuthPage>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        forceRedirectUrl={`${basePath}/user-portal`}
      />
    </AuthPage>
  );
}

function AccountWorkspace() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<ApoloUserProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isUserLoaded || !user?.id) return;
    let active = true;
    setProfileStatus('loading');

    fetch('/api/profile')
      .then(async (response) => {
        if (!response.ok) throw new Error('Não foi possível carregar o perfil.');
        return response.json() as Promise<{ profile: ApoloUserProfile | null }>;
      })
      .then((result) => {
        if (!active) return;
        setProfile(result.profile);
        setProfileStatus('ready');
      })
      .catch(() => {
        if (active) setProfileStatus('error');
      });

    return () => {
      active = false;
    };
  }, [isUserLoaded, user?.id, retryCount]);

  const saveProfile = useCallback(async (nextProfile: ApoloUserProfile) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextProfile),
    });
    const result = await response.json() as { profile?: ApoloUserProfile; error?: string };
    if (!response.ok || !result.profile) {
      throw new Error(result.error || 'Não foi possível guardar o perfil.');
    }
    setProfile(result.profile);
  }, []);

  const handleSignOut = () => {
    void signOut({ redirectUrl: basePath || '/' });
  };

  if (!isUserLoaded || profileStatus === 'loading') {
    return <LoadingScreen message="A carregar os dados da tua conta..." />;
  }

  if (profileStatus === 'error') {
    return (
      <main className="apolo-auth-page flex min-h-[100dvh] items-center justify-center px-5 text-[#e4edff]">
        <section className="w-full max-w-md border border-rose-500/30 bg-[#061329] p-6">
          <h1 className="text-lg font-semibold text-white">Não consegui carregar o teu perfil</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">A tua sessão está ativa, mas a ligação ao perfil falhou. Tenta novamente.</p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500">Tentar novamente</button>
            <button type="button" onClick={handleSignOut} className="border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800">Terminar sessão</button>
          </div>
        </section>
      </main>
    );
  }

  if (!profile) {
    const initialFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
    return (
      <UserOnboarding
        initialEmail={user?.primaryEmailAddress?.emailAddress || ''}
        initialFullName={initialFullName}
        onComplete={saveProfile}
      />
    );
  }

  return <App initialProfile={profile} onProfileSave={saveProfile} onSignOut={handleSignOut} />;
}

function PortalRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  return isSignedIn ? <AccountWorkspace /> : <Redirect to="/" />;
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        ...ptPT,
        formFieldInputPlaceholder__signUpPassword: 'Cria uma palavra-passe',
        signIn: {
          ...ptPT.signIn,
          start: { ...ptPT.signIn.start, title: 'Bem-vindo de volta', subtitle: 'Entra na tua conta APOLO' },
        },
        signUp: {
          ...ptPT.signUp,
          start: { ...ptPT.signUp.start, title: 'Criar conta', subtitle: 'Começa a tua experiência APOLO' },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/user-portal" component={PortalRoute} />
        <Route path="/sign-in/*?" component={SignInRoute} />
        <Route path="/sign-up/*?" component={SignUpRoute} />
        <Route><Redirect to="/" /></Route>
      </Switch>
    </ClerkProvider>
  );
}

export default function AuthApp() {
  return (
    <WouterRouter base={basePath}>
      <ClerkRoutes />
    </WouterRouter>
  );
}
