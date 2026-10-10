import { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../constants/publicRoutes.js';
import { Icon } from '../common/Icon.jsx';

// Pages declare their trail with useBreadcrumbs([...]); the top bar renders it.
const BreadcrumbContext = createContext({ trail: [], setTrail: () => {} });

export function BreadcrumbProvider({ children }) {
  const [trail, setTrail] = useState([]);
  return <BreadcrumbContext.Provider value={{ trail, setTrail }}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumbs(items) {
  const { setTrail } = useContext(BreadcrumbContext);
  const key = JSON.stringify(items);
  useEffect(() => {
    setTrail(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setTrail]);
}

export function Breadcrumbs() {
  const { trail } = useContext(BreadcrumbContext);
  const items = [{ label: 'Admin', to: PATHS.admin }, ...trail];
  return (
    <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 && <Icon name="chevron-right" size={14} />}
              {last || !item.to ? <span aria-current={last ? 'page' : undefined}>{item.label}</span> : <Link to={item.to}>{item.label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
