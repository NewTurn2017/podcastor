import { GeneratePodcastProps } from '@/types'
import React, { useState } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid'
import { generateUploadUrl } from '@/convex/files'
import { useUploadFiles } from '@xixixao/uploadstuff/react'
import { useToast } from '@/components/ui/use-toast'

const useGeneragePodcast = ({
  setAudio,
  voiceType,
  voicePrompt,
  setAudioStorageId,
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(generateUploadUrl)

  const getPodcastAudio = useAction(api.openai.generateAudioAction)

  const getAudioUrl = useMutation(api.podcasts.getUrl)

  const generatePodcast = async () => {
    setIsGenerating(true)
    setAudio('')

    if (!voicePrompt) {
      toast({
        title: '팟캐스트 생성을 위한 프롬프트를 제공해주세요',
      })
      return setIsGenerating(false)
    }

    if (!voiceType) {
      toast({
        title: '팟캐스트 생성을 위한 AI 음성을 선택하세요.',
      })
      return setIsGenerating(false)
    }

    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt,
      })

      const blob = new Blob([response], { type: 'audio/mpeg' })
      const fileName = `podcast-${uuidv4()}.mp3`
      const file = new File([blob], fileName, { type: 'audio/mpeg' })

      const uploaded = await startUpload([file])
      const storageId = (uploaded[0].response as any).storageId
      setAudioStorageId(storageId)
      const audioUrl = await getAudioUrl({ storageId })
      setAudio(audioUrl!)
      setIsGenerating(false)
      toast({
        title: '팟캐스트 생성이 완료되었습니다.',
      })
    } catch (error) {
      toast({
        title: '팟캐스트 생성에 실패했습니다.',
        variant: 'destructive',
      })
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    generatePodcast,
  }
}

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneragePodcast(props)

  return (
    <div>
      <div className='flex flex-col gap-2.5'>
        <Label className='text-16 font-bold text-white-1'>
          팟캐스트 생성용 AI 프롬프트
        </Label>
        <Textarea
          className='input-class font-light focus-visible:ring-offset-orange-1'
          placeholder='팟캐스트 에피소드 대본'
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className='mt-5 w-full max-w-[200px]'>
        <Button
          type='button'
          className='text-16 bg-orange-1 py-4 font-bold text-white-1'
          onClick={generatePodcast}
        >
          {isGenerating ? (
            <>
              생성 중입니다...
              <Loader size={20} className='animate-spin ml-2' />
            </>
          ) : (
            '팟캐스트 생성'
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className='mt-5'
          onLoadedMetadata={(e) =>
            props.setAudioDuration(e.currentTarget.duration)
          }
        />
      )}
    </div>
  )
}

export default GeneratePodcast
