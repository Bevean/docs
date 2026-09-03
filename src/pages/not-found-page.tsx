import { Link } from 'react-router'
import { useDocumentMeta } from '@/app/use-document-meta.ts'

export function NotFoundPage() {
  useDocumentMeta('Página não encontrada — Central de Ajuda Bevean')

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-[13px] font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        Não encontramos esta página
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
        O endereço pode ter mudado ou o artigo pode ter sido movido para outra coleção.
      </p>
      <Link
        to="/ajuda"
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Ver todas as coleções
      </Link>
    </div>
  )
}
