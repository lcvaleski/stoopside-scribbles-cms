import Image from 'next/image'

export default function Header() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 20px 30px 20px'
    }}>
      <Image 
        src="/header.png"
        alt="Stoopside CMS - From porch to page"
        width={300}
        height={75}
        priority
        style={{
          width: '300px',
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  )
}