import {X} from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  useEffect(() => {
    if (!expanded) return;
    const scrollY = window.scrollY;
    const originalSystem = {
      overflow: document.body.style.overflow,
      height: document.body.style.height,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
    return () => {
      document.body.style.overflow = originalSystem.overflow;
      document.body.style.height = originalSystem.height;
      document.body.style.position = originalSystem.position;
      document.body.style.width = originalSystem.width;
      document.body.style.top = originalSystem.top;

      window.scrollTo(0, scrollY);
    };
  }, [expanded]);
  useEffect(() => {
    if (!expanded) return;
    const handleEspcape = (event: KeyboardEvent) => {
      if (event.key === 'ESC') {
        close();
      }
    };
    document.addEventListener('keydown', handleEspcape);
    return () => document.removeEventListener('keydown', handleEspcape);
  }, [expanded, close]);
  return (
    <div
      aria-modal="true"
      role="dialog"
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${
        expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50">
        {/* Aside panel */}
        <aside
          className={`absolute top-0 right-0 h-screen w-full max-w-md flex flex-col bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            expanded ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <header className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-playfair text-brand-navy text-xl">{heading}</h3>
            <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300 ">
              <X className="w-5 h-5" onClick={close} />
            </button>
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </aside>
      </div>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
