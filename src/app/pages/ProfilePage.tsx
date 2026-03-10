import { Camera, User } from 'lucide-react';

export function ProfilePage() {
  return (
    <div>
      {/* Dados pessoais concentrados no topo da página. */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-black via-white/5 to-black/80 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              <User className="w-8 h-8 text-white/80" />
              <button
                type="button"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"
                aria-label="Atualizar foto do perfil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-[0.3em]">Perfil principal</p>
              <h1 className="text-white text-2xl md:text-3xl font-semibold mt-2">Marina Souza</h1>
              <p className="text-white/50 text-xs md:text-sm mt-2">marina.souza@email.com</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs md:text-sm text-white/80"
            >
              Editar dados
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white text-black px-4 py-2 text-xs md:text-sm font-semibold"
            >
              Atualizar senha
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
