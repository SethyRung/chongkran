export function useAuthDestination() {
  const route = useRoute();
  const router = useRouter();
  const destination = computed(() => {
    const value = route.query.redirect;
    if (
      typeof value !== "string" ||
      !value.startsWith("/") ||
      /^(\/\/|\/auth(?:[/?#]|$))/.test(value) ||
      value.includes("\\") ||
      [...value].some((char) => char.charCodeAt(0) <= 32)
    )
      return "/";
    try {
      const url = new URL(value, "https://chongkran.invalid");
      if (
        url.origin !== "https://chongkran.invalid" ||
        /^\/auth(?:\/|$)/i.test(decodeURIComponent(url.pathname))
      )
        return "/";
      if (!router.resolve(value).matched.length) return "/";
      return value;
    } catch {
      return "/";
    }
  });

  function authPath(path: string, query: Record<string, string> = {}) {
    return {
      path,
      query: { ...query, ...(destination.value === "/" ? {} : { redirect: destination.value }) },
    };
  }

  return { destination, authPath };
}
