import { useState, useEffect } from "react"

/**
 * useTypewriter
 *
 * Animates a string from "" to the full `text` value character by character.
 * Only runs when `active` is true — if false, returns the full string immediately
 * (used for historical messages that should not re-animate on re-render).
 *
 * @param {string}  text   - Full target string
 * @param {boolean} active - Whether to animate (true for the latest AI message only)
 * @param {number}  speed  - Interval in ms between ticks (lower = faster)
 * @returns {string}       - Currently displayed substring
 */
export function useTypewriter(text, active, speed = 6) {
  const [displayed, setDisplayed] = useState(active ? "" : text)

  useEffect(() => {
    // No animation needed — show full text immediately
    if (!active) {
      setDisplayed(text)
      return
    }

    setDisplayed("")
    let index = 0

    const timer = setInterval(() => {
      index += 2                         // advance 2 chars per tick for snappier feel
      setDisplayed(text.slice(0, index))
      if (index >= text.length) clearInterval(timer)
    }, speed)

    return () => clearInterval(timer)
  }, [text, active, speed])

  return displayed
}
