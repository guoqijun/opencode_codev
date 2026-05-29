// A filesystem-free y18n implementation that replaces the `y18n` npm package.
// The real y18n tries to read locale JSON files from disk, which triggers EPERM
// on Windows Bun-compiled binaries when the locale files don't exist in the
// virtual filesystem. This shim never touches the filesystem.
//
// Used via a Bun build plugin in script/build.ts that aliases "y18n" → this file.

export default function y18n(_opts?: any) {
  const cache: Record<string, Record<string, any>> = Object.create(null)
  const locale = "en_US"
  cache[locale] = Object.create(null)

  function __(...args: any[]): string {
    if (typeof args[0] !== "string") {
      const [parts, ...rest] = args as [TemplateStringsArray, ...any[]]
      let str = ""
      parts.forEach((part: string, i: number) => {
        str += part
        if (typeof rest[i] !== "undefined") str += "%s"
      })
      args = [str, ...rest]
    }
    const str: string = args.shift()
    return cache[locale][str] || str
  }

  function __n(singular: string, plural: string, quantity: number, ...rest: any[]): string {
    const str = quantity === 1 ? singular : plural
    if (~str.indexOf("%d")) return str.replace("%d", String(quantity))
    return str
  }

  return {
    __,
    __n,
    setLocale(_locale: string) {},
    getLocale() {
      return locale
    },
    updateLocale(_obj: Record<string, string>) {},
    locale,
  }
}
