import { Navigate, type RouteObject } from 'react-router'
import { RootLayout } from './app/root-layout'
import { HomePage } from './pages/home-page'
import { CollectionPage } from './pages/collection-page'
import { CollectionChildPage } from './pages/collection-child-page'
import { ArticleBoundary } from './pages/article-boundary'
import { ArticleRoute } from './pages/article-route'
import { NotFoundPage } from './pages/not-found-page'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/ajuda" replace /> },
      { path: 'ajuda', element: <HomePage /> },
      { path: 'ajuda/:collection', element: <CollectionPage /> },
      {
        // As duas rotas podem cair num artigo, cujo corpo é um chunk próprio.
        path: 'ajuda/:collection/:child',
        element: (
          <ArticleBoundary>
            <CollectionChildPage />
          </ArticleBoundary>
        )
      },
      {
        path: 'ajuda/:collection/:section/:article',
        element: (
          <ArticleBoundary>
            <ArticleRoute />
          </ArticleBoundary>
        )
      },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]
