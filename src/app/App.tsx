import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  // O RouterProvider injeta o roteamento em toda a árvore de componentes.
  return <RouterProvider router={router} />;
}
