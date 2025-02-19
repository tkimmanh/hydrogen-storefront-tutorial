import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from './Aside';
import {MenuIcon, Search, ShoppingBag, User, UserIcon} from 'lucide-react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const [isScroll, setIsSrcoll] = useState(false);
  const [isScrollingUp, setisScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const {type: asideType} = useAside();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--announcement-height', isScroll ? '0px' : '40px');
    root.style.setProperty('--header-height', isScroll ? '64px' : '80px');

    const handleScroll = () => {
      if (asideType !== 'closed') return;
      const currentScrollY = window.scrollY;

      setisScrollingUp(lastScrollY > currentScrollY);
      setLastScrollY(currentScrollY);
      setIsSrcoll(currentScrollY > 50);

      window.addEventListener('scroll', handleScroll, {passive: true});
    };
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScroll, lastScrollY, asideType]);

  return (
    <div
      className={`fixed w-full z-40 transition-transform duration-500 ease-in-out ${
        !isScrollingUp && isScroll && asideType === 'closed'
          ? '-translate-y-full'
          : 'translate-y-0'
      }`}
    >
      {/* announcement bar */}
      <div
        className={`overflow-hidden transition-all duration-500 bg-brand-navy text-white ease-in-out ${
          isScroll ? 'max-h-0' : 'max-h-12'
        }`}
      >
        <div className="container mx-auto text-center py-2.5 px-4 ">
          <p className="font-source text-[13px] leading-tight sm:text-sm font-light tracking-wide">
            Complimentary Shipping on Orders Above 500$
          </p>
        </div>
      </div>
      {/* header */}
      <header
        className={`transition-all duration-500 ease-in-out border-b ${
          isScroll
            ? 'bg-white/80 backdrop-blur-lg shadow-sm border-transparent'
            : 'bg-white border-gray-100 '
        }`}
      >
        <div className="container mx-auto">
          {/* mobile logo */}
          <div
            className={`hidden max-[550px]:block text-center border-b border-b-gray-100 duration-300 transition-all ease-in-out ${
              isScroll ? 'py-1' : 'py-2'
            }`}
          >
            <NavLink
              prefetch="intent"
              to="/"
              className="font-playfair text-2xl tracking-normal inline-block"
            >
              <h1 className="font-medium my-0">Hydrogen Tutorial</h1>
            </NavLink>
          </div>
          {/* header content*/}
          <div
            className={`flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ease-in-out ${
              isScroll ? 'py-3 sm:py-4' : ''
            }`}
          >
            {/* toggle menu mobile */}
            <div className="lg:hidden">
              <HeaderMenuMobileToggle />
            </div>
            {/* logo (Above 550px)*/}
            <NavLink
              prefetch="intent"
              to="/"
              className={`font-playfair tracking-wide text-center block max-[550px]:hidden absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:text-left transition-all duration-300 ease-in-out ${
                isScroll ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[28px]'
              }`}
            >
              <h1>Hydrogen Tutorial</h1>
            </NavLink>
            {/* Desktop navigation */}
            <div className="hidden lg:block flex-1 -px-12">
              <HeaderMenu
                menu={menu}
                viewport="desktop"
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              ></HeaderMenu>
            </div>

            {/* Ctas */}
            <div className="flex items-center">
              <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;

  const {close} = useAside();

  const baseClassName =
    "transition-all duration-200 hover:text-brand-gold font-source relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-brand-gold after:transition-all after:duration-200 after:ease-in-out";
  const desktopClassName =
    'flex items-center justify-center space-x-12 text-sm uppercase tracking-wider';
  const mobileClassName = 'flex flex-col px-6';
  if (!menu) return null;
  return (
    <nav
      role="navigation"
      className={viewport === 'desktop' ? desktopClassName : mobileClassName}
    >
      {viewport === 'mobile' && (
        <>
          {/* header */}
          <div className="space-y-6 py-4">
            {menu.items.map((item) => {
              if (!item.url) return null;
              const url =
                item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(primaryDomainUrl)
                  ? new URL(item.url).pathname // url của shopify
                  : item.url; // url là url ngoài của shopify
              return (
                <NavLink
                  onClick={close}
                  prefetch="intent"
                  end
                  className={({isActive}) =>
                    `${baseClassName} text-lg py-2 block  ${
                      isActive ? 'text-brand-gold' : 'text-brand-navy'
                    }`
                  }
                  key={item.id}
                  to={url}
                >
                  {item.title}
                </NavLink>
              );
            })}
          </div>
          {/* footer link*/}
          <div className="mt-auto border-t border-gray-100 py-6">
            <div className="space-y-4">
              <NavLink
                to={'/account'}
                className={`flex items-center space-x-2 text-brand-navy hover:text-brand-gold`}
              >
                <User className="w-5 h-5"></User>
                <span className="font-source text-base ">Account</span>
              </NavLink>
              <button className="flex gap-x-2 items-center text-brand-navy hover:text-brand-gold w-full">
                <Search className="w-5 h-5"></Search>
                <span className="font-source text-base">Search</span>
              </button>
            </div>
          </div>
        </>
      )}
      {viewport === 'desktop' &&
        menu?.items.map((item) => {
          if (!item.url) return;
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname // url của shopify
              : item.url; // url là url ngoài của shopify
          return (
            <NavLink
              onClick={close}
              prefetch="intent"
              end
              className={({isActive}) =>
                `${baseClassName} ${
                  isActive ? 'text-brand-gold' : 'text-brand-navy'
                }`
              }
              key={item.id}
              to={url}
            >
              {item.title}
            </NavLink>
          );
        })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav
      className="flex items-center space-x-2 sm:space-x-3 lg:space-x-8"
      role="navigation"
    >
      <SearchToggle></SearchToggle>
      <NavLink
        prefetch="intent"
        to="/account"
        className="hover:text-brand-gold p-2 transition-all relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 hover:after:w-full after:h-[1px] after:bg-brand-gold after:transition-all after:duration-200 after:ease-in-out after:-translate-x-1/2"
      >
        <span className="sr-only">Account</span>
        <UserIcon className="w-5 h-5"></UserIcon>
      </NavLink>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="p-2 -ml-2 hover:text-brand-gold transition-colors"
      onClick={() => open('mobile')}
    >
      <MenuIcon className="w-6 h-6"></MenuIcon>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="hover:text-brand-gold p-2 transition-all relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 hover:after:w-full after:h-[1px] after:bg-brand-gold after:transition-all after:duration-200 after:ease-in-out after:-translate-x-1/2"
      onClick={() => open('search')}
    >
      <Search className="w-5 h-5"></Search>
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="relative duration-300 hover:text-brand-gold p-2 transition-all after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 hover:after:w-full after:h-[1px] after:bg-brand-gold after:transition-all after:duration-200 after:ease-in-out after:-translate-x-1/2"
      onClick={() => {
        open('cart');
        // publish(event,payload)
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <ShoppingBag className="w-5 h-5"></ShoppingBag>
      {count !== null && count > 0 && (
        <span className="absolute top-1 left-1 bg-brand-gold text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
