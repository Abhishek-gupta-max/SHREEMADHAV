import { NoticeBar } from './NoticeBar.jsx';
import { SiteNavbar } from './SiteNavbar.jsx';

/** Notice strip + navigation, kept fixed to the top while scrolling. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      <NoticeBar />
      <SiteNavbar />
    </header>
  );
}
