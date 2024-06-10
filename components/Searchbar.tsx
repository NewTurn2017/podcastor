'use client'

import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/useDebounce'

const Searchbar = () => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const pathname = usePathname()

  const debounceValue = useDebounce(search, 500)

  useEffect(() => {
    if (debounceValue) {
      router.push(`/discover?search=${debounceValue}`)
    } else if (!debounceValue && pathname === '/discover') {
      router.push('/discover')
    }
  }, [router, pathname, debounceValue])
  return (
    <div className='relative mt-8 block'>
      <Input
        className='input-class py-6 pl-12 focus-visible:ring-offset-orange-1'
        placeholder='팟캐스트를 찾아보세요.'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Image
        src='/icons/search.svg'
        alt='search'
        width={20}
        height={20}
        className='absolute left-4 top-3.5'
      />
    </div>
  )
}

export default Searchbar
