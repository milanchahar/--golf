import DrawsPageClient from './DrawsPageClient'

export const metadata = {
  title: 'Monthly Draws | Golf Heroes',
  description: 'View your Golf Heroes monthly draw results and see if your Stableford scores matched the winning numbers.',
}

export default function DrawsPage() {
  return <DrawsPageClient />
}
