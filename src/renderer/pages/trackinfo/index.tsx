import Layout from '../../components/layout'
import Container from '../../components/container'

import CheckboxNav from '../../components/checkbox'

import * as styles from '../../../../static/styles/page/indexBP20.module.scss'
import * as theme from './trackinfo.module.scss'

import React, { useContext, useState } from 'react'
import userContext from '../../api/context/user.context'
import trackInitials from '../../api/initials/track.initials'
import Skeleton from 'react-loading-skeleton'
import playerContext from '../../api/context/player.context'
import { object, string } from 'yup'
import { useFormik } from 'formik'
import { MdClose, MdContentCopy } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import toast from '../../api/toast'
import { replaceParams } from '../../utils/formatRpc'

export default function TrackInfoPage() {
    const { user, app, setApp } = useContext(userContext)
    const { currentTrack } = useContext(playerContext)
    const [modal, setModal] = useState(false)
    const [modalAnim, setModalAnim] = useState(false)
    const [previousValues, setPreviousValues] = useState({
        appId: '',
        details: '',
        state: '',
        button: '',
    })
    const navigate = useNavigate()
    const schema = object().shape({
        appId: string()
            .nullable()
            .notRequired()
            .test(
                'len',
                'Минимальная длина 18 символов',
                val => !val || val.length >= 18,
            )
            .test(
                'len',
                'Максимальная длина 20 символов',
                val => !val || val.length <= 20,
            ),
        details: string()
            .test(
                'len',
                'Минимальная длина 2 символа',
                val => !val || val.length >= 2,
            )
            .test(
                'len',
                'Максимальная длина 128 символов',
                val => !val || val.length <= 128,
            ),
        state: string()
            .test(
                'len',
                'Минимальная длина 2 символа',
                val => !val || val.length >= 2,
            )
            .test(
                'len',
                'Максимальная длина 128 символов',
                val => !val || val.length <= 128,
            ),
        button: string().test(
            'len',
            'Максимальная длина 30 символов',
            val => !val || val.length <= 30,
        ),
    })
    const copyValues = async (value: string) => {
        setModalAnim(false)
        setTimeout(() => setModal(false), 200)
        await navigator.clipboard.writeText(value)
        toast.success('Скопировано в буфер обмена')
    }
    const getChangedValues = (initialValues: any, currentValues: any) => {
        const changedValues: any = {}
        for (const key in initialValues) {
            if (initialValues[key] !== currentValues[key]) {
                changedValues[key] = currentValues[key]
            }
        }
        return changedValues
    }
    const formik = useFormik({
        initialValues: {
            appId: app.discordRpc.appId,
            details: app.discordRpc.details,
            state: app.discordRpc.state,
            button: app.discordRpc.button,
        },
        validationSchema: schema,
        onSubmit: values => {
            const changedValues = getChangedValues(previousValues, values)
            if (Object.keys(changedValues).length > 0) {
                window.desktopEvents?.send('update-rpcSettings', changedValues)
                setPreviousValues(values)
                setApp({
                    ...app,
                    discordRpc: {
                        ...app.discordRpc,
                        ...values,
                    },
                })
            }
        },
    })

    const handleBlur = (e: any) => {
        formik.handleBlur(e)
        const changedValues = getChangedValues(previousValues, formik.values)
        if (formik.isValid && Object.keys(changedValues).length > 0) {
            formik.handleSubmit()
        }
    }
    return (
        <Layout title="Discord RPC">
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.main_container}>
                        <Container
                            titleName={'Discord RPC'}
                            imageName={'discord'}
                        >
                            <div className={theme.container}>
                                <form>
                                    <div className={theme.discordRpcSettings}>
                                        <div
                                            className={theme.optionalContainer}
                                        >
                                            <div
                                                className={theme.optionalTitle}
                                            >
                                                Обзор
                                            </div>
                                            <CheckboxNav
                                                checkType="startDiscordRpc"
                                                description="Активируйте этот параметр, чтобы ваш текущий статус отображался в Discord."
                                            >
                                                Включить статус дискорд
                                            </CheckboxNav>
                                        </div>
                                        <div className={theme.line}></div>
                                        <div
                                            className={theme.optionalContainer}
                                        >
                                            <div
                                                className={theme.optionalTitle}
                                            >
                                                Настроить статус
                                            </div>
                                            <div
                                                className={
                                                    theme.textInputContainer
                                                }
                                            >
                                                <div>App ID</div>
                                                <input
                                                    type="text"
                                                    name="appId"
                                                    aria-errormessage={
                                                        (formik.errors as any)[
                                                            'appId'
                                                        ]
                                                    }
                                                    placeholder="984031241357647892"
                                                    className={
                                                        theme.styledInput
                                                    }
                                                    value={formik.values.appId}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={e => {
                                                        handleBlur(e)
                                                        //handleBlurCount()
                                                    }}
                                                />
                                                {formik.touched.appId &&
                                                formik.errors.appId ? (
                                                    <div
                                                        className={theme.error}
                                                    >
                                                        {formik.errors.appId}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div
                                                className={
                                                    theme.textInputContainer
                                                }
                                            >
                                                <div>Details</div>
                                                <input
                                                    type="text"
                                                    name="details"
                                                    placeholder="enter text"
                                                    className={
                                                        theme.styledInput
                                                    }
                                                    value={
                                                        formik.values.details
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={e => {
                                                        handleBlur(e)
                                                    }}
                                                />
                                                {formik.touched.details &&
                                                formik.errors.details ? (
                                                    <div
                                                        className={theme.error}
                                                    >
                                                        {formik.errors.details}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div
                                                className={
                                                    theme.textInputContainer
                                                }
                                            >
                                                <div>State</div>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    placeholder="enter text"
                                                    className={
                                                        theme.styledInput
                                                    }
                                                    value={formik.values.state}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={e => {
                                                        handleBlur(e)
                                                    }}
                                                />
                                                {formik.touched.state &&
                                                formik.errors.state ? (
                                                    <div
                                                        className={theme.error}
                                                    >
                                                        {formik.errors.state}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div
                                                className={
                                                    theme.openModalButton
                                                }
                                                onClick={() => {
                                                    setModalAnim(true),
                                                        setModal(true)
                                                }}
                                            >
                                                Посмотреть все параметры полей.
                                            </div>
                                            <div className={theme.line}></div>
                                            <CheckboxNav
                                                checkType="enableRpcButtonListen"
                                                description="Активируйте этот параметр, чтобы ваш текущий статус отображался в Discord."
                                            >
                                                Включить кнопку (Слушать)
                                            </CheckboxNav>
                                            <div
                                                className={
                                                    theme.textInputContainer
                                                }
                                            >
                                                <div>Button</div>
                                                <input
                                                    type="text"
                                                    name="button"
                                                    placeholder="enter text"
                                                    className={
                                                        theme.styledInput
                                                    }
                                                    value={formik.values.button}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={e => {
                                                        handleBlur(e)
                                                    }}
                                                />
                                                {formik.touched.button &&
                                                formik.errors.button ? (
                                                    <div
                                                        className={theme.error}
                                                    >
                                                        {formik.errors.button}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <CheckboxNav
                                                disabled={
                                                    !user.badges.some(
                                                        badge =>
                                                            badge.type ===
                                                            'supporter',
                                                    )
                                                }
                                                checkType="enableGithubButton"
                                                description="Активируйте этот параметр, чтобы показать что вы любите разработчиков."
                                            >
                                                Включить кнопку (Open in Github)
                                            </CheckboxNav>
                                        </div>
                                    </div>
                                </form>
                                <div className={theme.discordRpc}>
                                    <img
                                        className={theme.userBanner}
                                        src={
                                            user.banner
                                                ? user.banner
                                                : 'static/assets/images/no_banner.png'
                                        }
                                        alt=""
                                    />
                                    <div>
                                        <img
                                            className={theme.userAvatar}
                                            src={user.avatar}
                                            alt=""
                                        />
                                        <div className={theme.userName}>
                                            {user.username}
                                        </div>
                                        <div className={theme.userRPC}>
                                            <div className={theme.status}>
                                                Слушает
                                            </div>
                                            <div className={theme.statusRPC}>
                                                <div>
                                                    {app.discordRpc.status &&
                                                    currentTrack !==
                                                        trackInitials ? (
                                                        <div
                                                            className={
                                                                theme.flex_container
                                                            }
                                                        >
                                                            <img
                                                                className={
                                                                    theme.img
                                                                }
                                                                src={
                                                                    currentTrack
                                                                        .requestImgTrack[1]
                                                                        ? currentTrack
                                                                              .requestImgTrack[1]
                                                                        : './static/assets/logo/logoappsummer.png'
                                                                }
                                                                alt=""
                                                            />
                                                            <div
                                                                className={
                                                                    theme.gap
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        theme.appName
                                                                    }
                                                                >
                                                                    PulseSync
                                                                </div>
                                                                <div
                                                                    className={
                                                                        theme.name
                                                                    }
                                                                >
                                                                    {app
                                                                        .discordRpc
                                                                        .details
                                                                        .length >
                                                                    0
                                                                        ? replaceParams(
                                                                              app
                                                                                  .discordRpc
                                                                                  .details,
                                                                              currentTrack,
                                                                          )
                                                                        : `${currentTrack.playerBarTitle} - ${currentTrack.artist}`}
                                                                </div>
                                                                {currentTrack
                                                                    .timecodes
                                                                    .length >
                                                                    0 && (
                                                                    <div
                                                                        className={
                                                                            theme.time
                                                                        }
                                                                    >
                                                                        {app
                                                                            .discordRpc
                                                                            .state
                                                                            .length >
                                                                        0
                                                                            ? replaceParams(
                                                                                  app
                                                                                      .discordRpc
                                                                                      .state,
                                                                                  currentTrack,
                                                                              )
                                                                            : `${currentTrack.timecodes[0]} - ${currentTrack.timecodes[1]}`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={
                                                                theme.flex_container
                                                            }
                                                        >
                                                            <Skeleton
                                                                width={58}
                                                                height={58}
                                                            />
                                                            <div
                                                                className={
                                                                    theme.gap
                                                                }
                                                            >
                                                                <Skeleton
                                                                    width={70}
                                                                    height={19}
                                                                />
                                                                <Skeleton
                                                                    width={190}
                                                                    height={16}
                                                                />
                                                                <Skeleton
                                                                    width={80}
                                                                    height={16}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div
                                                    className={theme.buttonRpc}
                                                >
                                                    <div
                                                        className={theme.button}
                                                        onClick={() => {
                                                            window.open(
                                                                'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                                            )
                                                        }}
                                                    >
                                                        Слушать трек на Яндекс
                                                        Музыке
                                                    </div>
                                                    <div
                                                        className={theme.button}
                                                        onClick={() => {
                                                            window.open(
                                                                'https://github.com/PulseSync-LLC/YMusic-DRPC/tree/patcher-ts',
                                                            )
                                                        }}
                                                    >
                                                        Open in Github
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {modal && (
                                    <div
                                        className={
                                            modalAnim
                                                ? theme.modalBlur
                                                : theme.modalBlurOff
                                        }
                                    >
                                        <div
                                            className={theme.modalCloseZone}
                                            onClick={() => {
                                                setModalAnim(false),
                                                    setTimeout(
                                                        () => setModal(false),
                                                        200,
                                                    )
                                            }}
                                        ></div>
                                        <div className={theme.modal}>
                                            <div className={theme.modalTitle}>
                                                <div>Параметры полей</div>
                                                <button
                                                    className={theme.closeModal}
                                                    onClick={() => {
                                                        setModalAnim(false)
                                                        setTimeout(
                                                            () =>
                                                                setModal(false),
                                                            200,
                                                        )
                                                    }}
                                                >
                                                    <MdClose size={20} />
                                                </button>
                                            </div>
                                            <div
                                                className={theme.modalContainer}
                                            >
                                                <button
                                                    className={
                                                        theme.modalContextButton
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            theme.contextInfo
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                theme.contextPreview
                                                            }
                                                        >
                                                            track
                                                        </div>
                                                        - название трека
                                                    </div>
                                                    <MdContentCopy
                                                        cursor={'pointer'}
                                                        size={18}
                                                        onClick={() =>
                                                            copyValues(
                                                                '{track}',
                                                            )
                                                        }
                                                    />
                                                </button>
                                                <button
                                                    className={
                                                        theme.modalContextButton
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            theme.contextInfo
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                theme.contextPreview
                                                            }
                                                        >
                                                            atrist
                                                        </div>
                                                        - имя артиста
                                                    </div>
                                                    <MdContentCopy
                                                        cursor={'pointer'}
                                                        size={18}
                                                        onClick={() =>
                                                            copyValues(
                                                                '{artist}',
                                                            )
                                                        }
                                                    />
                                                </button>
                                                <button
                                                    className={
                                                        theme.modalContextButton
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            theme.contextInfo
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                theme.contextPreview
                                                            }
                                                        >
                                                            startTime
                                                        </div>
                                                        - начальное время
                                                    </div>
                                                    <MdContentCopy
                                                        cursor={'pointer'}
                                                        size={18}
                                                        onClick={() =>
                                                            copyValues(
                                                                '{startTime}',
                                                            )
                                                        }
                                                    />
                                                </button>
                                                <button
                                                    className={
                                                        theme.modalContextButton
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            theme.contextInfo
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                theme.contextPreview
                                                            }
                                                        >
                                                            endTime
                                                        </div>
                                                        - конечное время
                                                    </div>
                                                    <MdContentCopy
                                                        cursor={'pointer'}
                                                        size={18}
                                                        onClick={() =>
                                                            copyValues(
                                                                '{endTime}',
                                                            )
                                                        }
                                                    />
                                                </button>
                                                <button
                                                    className={
                                                        theme.modalContextButton
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            theme.contextInfo
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                theme.contextPreview
                                                            }
                                                        >
                                                            endTime - startTime
                                                        </div>
                                                        - до конца трека
                                                    </div>
                                                    <MdContentCopy
                                                        cursor={'pointer'}
                                                        size={18}
                                                        onClick={() =>
                                                            copyValues(
                                                                '{endTime - startTime}',
                                                            )
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
