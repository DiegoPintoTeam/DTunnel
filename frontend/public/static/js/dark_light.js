const THEME_KEY = 'dtunnel-theme'
const RANDOM_DAILY = 'random_daily'
const THEMES = ['enterprise', 'carbon', 'oceanic', 'crimson', 'forest', 'solar', 'oscuro', 'dia']
const THEME_CLASSES = THEMES.map(name => `theme-${name}`)

document.documentElement.classList.add('theme-preload')

const dailyTheme = () => {
    const now = new Date()
    const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
    let hash = 0
    for (let i = 0; i < dayKey.length; i += 1) {
        hash = (hash * 31 + dayKey.charCodeAt(i)) >>> 0
    }
    return THEMES[hash % THEMES.length]
}

const resolveTheme = theme => {
    let chosen = theme
    if (chosen === RANDOM_DAILY) {
        chosen = dailyTheme()
    }
    if (!THEMES.includes(chosen)) {
        chosen = 'enterprise'
    }
    return chosen
}

const getThemeRoots = () => [document.documentElement, document.body].filter(Boolean)

const applyThemeClass = chosen => {
    const nextClass = `theme-${chosen}`

    getThemeRoots().forEach(root => {
        THEME_CLASSES.forEach(themeClass => {
            if (themeClass !== nextClass) {
                root.classList.remove(themeClass)
            }
        })
        root.classList.add(nextClass)
    })
}

const syncThemeControls = (theme, chosen) => {
    document.querySelectorAll('.theme-select-control').forEach(select => {
        select.value = theme === RANDOM_DAILY ? RANDOM_DAILY : chosen
    })
}

const applyColorTheme = theme => {
    const chosen = resolveTheme(theme)
    applyThemeClass(chosen)
    syncThemeControls(theme, chosen)
}

const changeTheme = theme => {
    localStorage.setItem(THEME_KEY, theme)
    applyColorTheme(theme)
}

const storedTheme = localStorage.getItem('bs-theme')
const getPreferredTheme = () => {
    if (storedTheme) {
        return storedTheme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const setTheme = theme => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
        document.documentElement.setAttribute('data-bs-theme', theme)
    }
}

setTheme(getPreferredTheme())

const getStoredColorTheme = () => localStorage.getItem(THEME_KEY) || 'enterprise'

applyColorTheme(getStoredColorTheme())

const initColorTheme = () => {
    const storedColorTheme = getStoredColorTheme()

    applyColorTheme(storedColorTheme)
    document.documentElement.classList.remove('theme-preload')

    document.querySelectorAll('.theme-select-control').forEach(select => {
        select.addEventListener('change', () => changeTheme(select.value))
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initColorTheme)
} else {
    initColorTheme()
}