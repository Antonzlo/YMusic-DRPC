const getUserToken = () => {
    if (typeof window !== 'undefined') {
        return window.electron.store.get('token')
    }

    return ''
}

export default getUserToken
