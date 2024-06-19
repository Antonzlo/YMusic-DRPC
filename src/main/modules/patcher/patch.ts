import * as fs from 'node:fs'
import * as path from 'node:path'
import { exec } from 'child_process'
import asar from '@electron/asar'

class Patcher {
    constructor() {}

    static findRumScript(startDir: string): string {
        const files = fs.readdirSync(startDir)
        for (const file of files) {
            const filePath = path.join(startDir, file)
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
                const rumScriptPath = this.findRumScript(filePath)
                if (rumScriptPath) {
                    return rumScriptPath
                }
            } else if (file === 'rumScript.js') {
                return filePath
            }
        }
        return null
    }

    static findConfig(startDir: string): string {
        const files = fs.readdirSync(startDir)
        for (const file of files) {
            const filePath = path.join(startDir, file)
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
                const rumScriptPath = this.findConfig(filePath)
                if (rumScriptPath) {
                    return rumScriptPath
                }
            } else if (file === 'config.js') {
                return filePath
            }
        }
        return null
    }
    static findEvents(startDir: string): string {
        const files = fs.readdirSync(startDir)
        for (const file of files) {
            const filePath = path.join(startDir, file)
            const stat = fs.statSync(filePath)

            if (stat.isDirectory()) {
                if (file === 'node_modules' || file === 'constants') {
                    continue
                }
                const eventsScriptPath = this.findEvents(filePath)
                if (eventsScriptPath) {
                    return eventsScriptPath
                }
            } else if (file === 'events.js') {
                return filePath
            }
        }
        return null
    }

    static copyFile(filePath: string) {
        const copyCommand = `copy "${filePath}" "${filePath}.copy"`
        exec(copyCommand, (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`Ошибка при копировании файла: ${error}`)
                return
            }
            if (stderr) {
                console.error(`Ошибка при выполнении команды: ${stderr}`)
                return
            }
            console.log(`Файл успешно скопирован в ${filePath}.copy`)
        })
    }

    static async patchRum() {
        const appAsarPath =
            process.env.LOCALAPPDATA +
            '\\Programs\\YandexMusic\\resources\\app.asar'
        const destinationDir =
            process.env.LOCALAPPDATA + '\\Programs\\YandexMusic\\resources\\app'

        this.copyFile(appAsarPath)

        console.log(`Extracting app.asar to ${destinationDir}...`)
        asar.extractAll(appAsarPath, destinationDir)
        setTimeout(async () => {
            const rumScriptPath = this.findRumScript(destinationDir)

            if (rumScriptPath) {
                let rumScriptContent = fs.readFileSync(rumScriptPath, 'utf8')

                rumScriptContent += `
                let isScriptExecuted = false;
    
                function addHtmlToBody() {
                    const bodyElement = document.querySelector('body');
    
                    if (bodyElement && !isScriptExecuted) {
                        const customHtmlElement = document.createElement('div');
                        customHtmlElement.style = "position: absolute;top: -7px;right: 140px;color: rgb(255 255 255 / 29%);font-family: var(--ym-font-text);font-style: normal;font-weight: 100;letter-spacing: normal;line-height: var(--ym-font-line-height-label-s);"
    
                        customHtmlElement.innerHTML = '<p class="YMDRPC">YMusic-DRPC 2.0.5</p>';
    
                        bodyElement.appendChild(customHtmlElement);
    
                        isScriptExecuted = true;
                        
                        clearInterval(timerId);
                    }
                }
    
                const timerId = setInterval(addHtmlToBody, 1000);
    
                                                          
                function logPlayerBarInfo() {
                    const playerBarTitleElement = document.querySelector('[class*="PlayerBarDesktop_description"] [class*="Meta_title"]');
                    const linkTitleElement = document.querySelector('[class*="Meta_albumLink"]');
                    const artistLinkElement = document.querySelector('[class*="PlayerBarDesktop_description"] [class*="Meta_artists"]');
                    const timecodeElements = document.querySelectorAll('[class*="ChangeTimecode_timecode"]');
                    const imgElements = document.querySelectorAll('[class*="PlayerBarDesktop_cover"]');
                    imgElements.forEach(img => {
                        if (img.src && img.src.includes('/100x100')) {
                            img.src = img.src.replace('/100x100', '/1000x1000');
                        }
                        if (img.srcset && img.srcset.includes('/100x100')) {
                            img.srcset = img.srcset.replace('/100x100', '/1000x1000');
                        }
                        if (img.srcset && img.srcset.includes('/200x200 2x')) {
                            img.srcset = img.srcset.replace('/200x200 2x', '/1000x1000 2x');
                        }
                    });
                    const titleText = playerBarTitleElement ? playerBarTitleElement.textContent.trim() : '';
    
                    const artistTextElements = artistLinkElement ? artistLinkElement.querySelectorAll('[class*="Meta_artistCaption"]') : null;
                    const artistTexts = artistTextElements ? Array.from(artistTextElements).map(element => element.textContent.trim()) : [];
                    const linkTitle = linkTitleElement ? linkTitleElement.getAttribute('href') : '';
                    const albumId = linkTitle ? linkTitle.split('=')[1] : '';
                    let timecodesArray = Array.from(timecodeElements, (element) => element.textContent.trim());
                    if (timecodesArray.length > 2) {
                        timecodesArray = timecodesArray.slice(0, 2);
                    }
    
                    const ImgTrack = imgElements.length > 0 ? Array.from(imgElements, (element) => element.src) : [[None, 'ym']];
    
                    return {
                        playerBarTitle: titleText,
                        artist: artistTexts.join(', '),
                        timecodes: timecodesArray,
                        requestImgTrack: ImgTrack,
                        linkTitle: albumId
                    };
                }
    
                setInterval(() => {
                    const result = logPlayerBarInfo();
    
                    fetch('http://127.0.0.1:19582/update_data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(result),
                    });
                }, 1000);
    
                
                function updateStyle() {
                    var link = document.getElementById('dynamic-style');
                    if (!link) {
                        link = document.createElement('link');
                        link.id = 'dynamic-style';
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        document.head.appendChild(link);
                    }
                    link.href = 'http://127.0.0.1:19582/style.css';
                }
    
                function updateScript() {
                    var script = document.getElementById('dynamic-script');
                    if (!script) {
                        script = document.createElement('script');
                        script.id = 'dynamic-script';
                        document.head.appendChild(script);
                    }
                    script.src = 'http://127.0.0.1:19582/script.js';
                }
                const token = localStorage.getItem("oauth"); 
                fetch('http://127.0.0.1:19582/send_token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: token,
                    });


                setInterval(updateStyle, 2000);
                setInterval(updateScript, 2000);
                `

                fs.writeFileSync(rumScriptPath, rumScriptContent)

                console.log(`Added script to ${rumScriptPath}`)
            } else {
                console.log(`Could not find rumScript.js in ${destinationDir}`)
            }

            const configPath = this.findConfig(destinationDir)

            if (configPath) {
                let configPathContent = fs.readFileSync(configPath, 'utf8')
                let cfgReplace = configPathContent.replace(
                    'enableDevTools: false',
                    'enableDevTools: true',
                )

                fs.writeFileSync(configPath, cfgReplace)

                let configPathContentweb = fs.readFileSync(configPath, 'utf8')
                let websecReplace = configPathContentweb.replace(
                    'enableWebSecurity: true',
                    'enableWebSecurity: false',
                )

                fs.writeFileSync(configPath, websecReplace)
            }
            try {
                const eventsPath = this.findEvents(destinationDir)

                if (eventsPath) {
                    let eventsPathContent = fs.readFileSync(eventsPath, 'utf8')
                    const patchStr = `const handleApplicationEvents = (window) => {
    electron_1.session.defaultSession.webRequest.onCompleted({ urls: ['https://api.music.yandex.net/*'] }, (details) => {
            const url = details.url;
            const regex = /https:\\/\\/api\\.music\\.yandex\\.net\\/tracks\\/(\\d+)\\/download-info/;

            const match = url.match(regex);
            if (match && match[1]) {
                const trackId = match[1];
                console.log("Track ID found:", trackId);
                fetch("http://127.0.0.1:19582/track_info", {
                    method: "POST",
                    body: trackId
                })
            }
        });`
                    let eventsReplace = eventsPathContent.replace(
                        `const handleApplicationEvents = (window) => {`,
                        patchStr,
                    )

                    fs.writeFileSync(eventsPath, eventsReplace)
                    await asar
                        .createPackage(destinationDir, appAsarPath)
                        .then(e => {
                            console.log(
                                `App directory packed into ${appAsarPath}`,
                            )

                            console.log(`Deleting source directory...`)
                        })
                    console.log(`Packing app directory into app.asar...`)
                    exec(
                        `rmdir /s /q "${destinationDir}"`,
                        (
                            deleteError: any,
                            deleteStdout: any,
                            deleteStderr: any,
                        ) => {
                            if (deleteError) {
                                console.error(
                                    `Error deleting source directory: ${deleteError.message}`,
                                )
                                return
                            }
                            if (deleteStderr) {
                                console.error(`stderr: ${deleteStderr}`)
                                return
                            }
                            console.log(deleteStdout)
                            console.log(`Source directory deleted`)
                        },
                    )
                } else {
                    console.log(`Could not find config.js in ${configPath}`)
                }
            } catch (e) {
                console.error(`Error: ${e}`)
            }
        }, 2000)
    }
}
export default Patcher
