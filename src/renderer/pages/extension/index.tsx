import Layout from '../../components/layout'
import Container from '../../components/container'

import * as styles from '../../../../static/styles/page/index.module.scss'
import * as theme from './extension.module.scss'
import ExtensionCard from '../../components/extensionCard'
import { useEffect, useMemo, useState } from 'react'
import ThemeInterface from '../../api/interfaces/theme.interface'
import Button_nav from '../../components/button_nav'
import { MdAdminPanelSettings } from 'react-icons/md'

export default function ThemePage() {
    const [themes, setThemes] = useState<ThemeInterface[]>([])
    const [selectedTheme, setSelectedTheme] = useState(
        window.electron.store.get('theme'),
    )

    useEffect(() => {
        if (typeof window !== 'undefined' && window.desktopEvents) {
            console.log('Fetching themes')
            window.desktopEvents
                .invoke('getThemes')
                .then((themes: ThemeInterface[]) => {
                    console.log('Received themes:', themes)
                    setThemes(themes)
                })
                .catch(error => {
                    console.error('Error receiving themes:', error)
                })
        }
    }, [])
    useEffect(() => {
        if (!selectedTheme) {
            setSelectedTheme('Default')
            window.electron.store.set('theme', 'Default')
        }
    }, [selectedTheme])

    const handleCheckboxChange = (themeName: string, isChecked: boolean) => {
        if (isChecked) {
            window.electron.store.set('theme', themeName)
            setSelectedTheme(themeName)
            window.desktopEvents.send('themeChanged', themeName)
        } else {
            window.electron.store.set('theme', 'Default')
            setSelectedTheme('Default')
            window.desktopEvents.send('themeChanged', 'Default')
        }
    }

    return (
        <Layout title="Стилизация">
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.main_container}>
                        <Container
                            titleName={'Ваши Расширения'}
                            imageName={'extension'}
                            onClick={() =>
                                window.desktopEvents.send(
                                    'openPath',
                                    'themePath',
                                )
                            }
                            buttonName={'Директория аддонов'}
                        >
                            <div className={theme.grid}>
                                {themes
                                    .filter(theme => theme.name != 'Default')
                                    .map(theme => (
                                        <ExtensionCard
                                            key={theme.name}
                                            theme={theme}
                                            isChecked={
                                                selectedTheme === theme.name
                                            }
                                            onCheckboxChange={
                                                handleCheckboxChange
                                            }
                                        />
                                    ))}
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
