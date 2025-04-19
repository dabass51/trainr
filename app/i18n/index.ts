import en from '@/messages/en.json'
import de from '@/messages/de.json'

const messages = {
  en,
  de,
}

type Messages = typeof en

function get(obj: any, path: string) {
  const keys = path.split('.')
  return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}

export function getTranslations(lang: string) {
  return {
    t: (key: keyof Messages | (string & {})) => {
      const message = get(messages[lang as keyof typeof messages], key)
      if (!message) {
        console.warn(`Translation key "${key}" not found in ${lang}`)
        return key
      }
      return message
    },
    lang,
  }
} 