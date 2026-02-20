type ScrollBannerProps = {
  items: string[]
}

export default function ScrollBanner({ items }: ScrollBannerProps) {
  const renderItems = () =>
    items.map((item, i) => (
      <li key={i} className="inline-flex items-center whitespace-nowrap px-8 text-sm font-medium">
        <span className="mr-8">{item}</span>
        <span aria-hidden="true" className="opacity-40">✦</span>
      </li>
    ))

  return (
    <div
      className="w-full overflow-hidden py-3"
      role="marquee"
      aria-label="Scrolling Warhammer 40k faction names"
    >
      <div className="scroll-banner-track flex">
        <ul className="flex shrink-0 list-none m-0 p-0 text-gold" aria-label="Announcements">
          {renderItems()}
          {renderItems()}
        </ul>
        <ul className="flex shrink-0 list-none m-0 p-0 text-gold" aria-hidden="true">
          {renderItems()}
          {renderItems()}
        </ul>
      </div>
    </div>
  )
}
