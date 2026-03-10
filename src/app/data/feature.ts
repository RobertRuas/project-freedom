import {
  Bell,
  Brush,
  CreditCard,
  Globe,
  Lock,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  User,
  UserCog,
  UserRoundPlus,
} from 'lucide-react';
import type { FeatureGridItem } from '../components/FeatureGrid';

/**
 * Opções da página de busca.
 */
export const searchFeatures: FeatureGridItem[] = [
  {
    id: 'search-1',
    title: 'Busca Inteligente',
    description: 'Encontre títulos por nome, ator, gênero e palavras relacionadas em um único campo.',
    actionLabel: 'Explorar',
    icon: Search,
  },
  {
    id: 'search-2',
    title: 'Filtros Avançados',
    description: 'Combine filtros de ano, duração, idioma e classificação para resultados mais precisos.',
    actionLabel: 'Filtrar',
    icon: SlidersHorizontal,
  },
  {
    id: 'search-3',
    title: 'Favoritos em Destaque',
    description: 'Acesse rapidamente conteúdos curtidos e continue assistindo sem perder contexto.',
    actionLabel: 'Ver Favoritos',
    icon: Star,
  },
];

/**
 * Opções da página de configurações.
 */
export const settingsFeatures: FeatureGridItem[] = [
  {
    id: 'settings-1',
    title: 'Preferências da Conta',
    description: 'Atualize idioma, região e comportamento padrão de reprodução.',
    actionLabel: 'Editar',
    icon: UserCog,
  },
  {
    id: 'settings-2',
    title: 'Notificações',
    description: 'Defina quais alertas você quer receber por push, e-mail e dentro da plataforma.',
    actionLabel: 'Configurar',
    icon: Bell,
  },
  {
    id: 'settings-3',
    title: 'Privacidade e Segurança',
    description: 'Gerencie sessões ativas, autenticação em dois fatores e permissões de acesso.',
    actionLabel: 'Gerenciar',
    icon: Shield,
  },
  {
    id: 'settings-4',
    title: 'Assinatura e Cobrança',
    description: 'Consulte plano atual, forma de pagamento e histórico de faturas.',
    actionLabel: 'Abrir',
    icon: CreditCard,
  },
  {
    id: 'settings-5',
    title: 'Aparência',
    description: 'Ajuste temas visuais, tamanho de fontes e contraste para melhor leitura.',
    actionLabel: 'Personalizar',
    icon: Brush,
  },
  {
    id: 'settings-6',
    title: 'Controle Parental',
    description: 'Crie perfis protegidos com PIN e restrições por faixa etária.',
    actionLabel: 'Definir',
    icon: Lock,
  },
];

/**
 * Opções da página de perfil.
 */
export const profileFeatures: FeatureGridItem[] = [
  {
    id: 'profile-1',
    title: 'Dados Pessoais',
    description: 'Visualize e atualize seu nome, e-mail e informações de contato.',
    actionLabel: 'Atualizar',
    icon: User,
  },
  {
    id: 'profile-2',
    title: 'Perfis da Família',
    description: 'Crie, edite e organize perfis para cada pessoa que usa a conta.',
    actionLabel: 'Gerenciar',
    icon: UserRoundPlus,
  },
  {
    id: 'profile-3',
    title: 'Idiomas e Legendas',
    description: 'Escolha idioma preferido de áudio, legendas e acessibilidade.',
    actionLabel: 'Ajustar',
    icon: Globe,
  },
];
