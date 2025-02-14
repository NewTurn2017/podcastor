'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import GeneratePodcast from '@/components/GeneratePodcast'
import GenerateThumbnail from '@/components/GenerateThumbnail'
import { Loader } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'
import { useToast } from '@/components/ui/use-toast'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'

const voiceCategories = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx']

const formSchema = z.object({
  podcastTitle: z.string().min(2),
  podcastDescription: z.string().min(2),
})

const CreatePodcast = () => {
  const router = useRouter()
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageStorageId, setImageStorageId] = useState<Id<'_storage'> | null>(
    null
  )
  const [imageUrl, setImageUrl] = useState('')

  const [audioUrl, setAudioUrl] = useState('')
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioStorageId, setAudioStorageId] = useState<Id<'_storage'> | null>(
    null
  )

  const [voiceType, setVoiceType] = useState<string | null>(null)
  const [voicePrompt, setVoicePrompt] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPodcast = useMutation(api.podcasts.createPodcast)

  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: '',
      podcastDescription: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log('onsubmit')
    try {
      setIsSubmitting(true)
      if (!audioUrl || !imageUrl || !voiceType) {
        toast({
          title: '팟캐스트와 썸네일을 먼저 생성해주세요',
        })
        setIsSubmitting(false)
        throw new Error('팟캐스트와 썸네일을 생성하세요')
      }

      const podcast = await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        voiceType,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
      })

      toast({ title: '팟캐스트 생성에 성공했습니다.' })
      setIsSubmitting(false)
      router.push('/')
    } catch (error) {
      console.error(error)
      toast({
        title: '팟캐스트 생성에 실패했습니다.',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <section className='mt-10 flex flex-col'>
      <h1 className='text-20 font-bold text-white-1'>팟캐스트 만들기</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='mt-12 flex w-full flex-col'
        >
          <div className='flex flex-col gap-[30px] border-b border-black-5 pb-10'>
            <FormField
              control={form.control}
              name='podcastTitle'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2.5'>
                  <FormLabel className='text-16 font-bold text-white-1'>
                    제목
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='input-class focus-visible:ring-offset-orange-1'
                      placeholder='Genie 팟캐스트'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='text-white-1' />
                </FormItem>
              )}
            />
            <div className='flex flex-col gap-2.5'>
              <Label className='text-16 font-bold text-white-1'>
                AI음성을 선택하세요
              </Label>
              <Select onValueChange={(value) => setVoiceType(value)}>
                <SelectTrigger
                  className={cn(
                    'text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1'
                  )}
                >
                  <SelectValue
                    className='placeholder:text-gray-1 focus-visible:ring-offset-orange-1'
                    placeholder='AI음성을 선택하세요'
                  />
                </SelectTrigger>
                <SelectContent className='text-16 border-none bg-black-1 text-white-1 font-bold'>
                  {voiceCategories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className='capitalize'
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
                {voiceType && (
                  <audio
                    src={`/${voiceType}.mp3`}
                    autoPlay
                    className='hidden'
                  />
                )}
              </Select>
            </div>

            <FormField
              control={form.control}
              name='podcastDescription'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2.5'>
                  <FormLabel className='text-16 font-bold text-white-1'>
                    설명
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className='input-class focus-visible:ring-offset-orange-1'
                      placeholder='Genie 팟캐스트에 대한 간단한 설명'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='text-white-1' />
                </FormItem>
              )}
            />
          </div>

          <div className='flex flex-col pt-10'>
            <GeneratePodcast
              setAudioStorageId={setAudioStorageId}
              setAudio={setAudioUrl}
              voiceType={voiceType!}
              audio={audioUrl}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              setAudioDuration={setAudioDuration}
            />

            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />

            <div className='mt-10 w-full'>
              <Button
                type='submit'
                className='text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1'
              >
                {isSubmitting ? (
                  <>
                    생성 중입니다...
                    <Loader size={20} className='animate-spin ml-2' />
                  </>
                ) : (
                  '팟캐스트 제출 및 게시'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  )
}

export default CreatePodcast
