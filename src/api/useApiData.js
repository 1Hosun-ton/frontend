import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/*
 화면에서 쓰는 조회용 훅. 부르는 쪽은 { data, error, loading, reload }만 보면 된다.
 load는 useCallback으로 감싸서 넘기고, 그 안에서 쓰는 값(기간 같은 것)을 의존성에 적어야 한다.
 화면을 떠난 뒤 늦게 도착한 응답이 상태를 건드리지 않도록 무시한다.
*/
export function useApiData(load) {
  const navigate = useNavigate()
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let alive = true
    /*
     다시 불러올 때 이전 결과를 비운다.
     안 비우면 기간을 바꿨을 때 지난 기간 결과가 그대로 남아 보인다.
    */
    // oxlint-disable-next-line react/set-state-in-effect
    setState({ data: null, error: null, loading: true })
    load()
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (!alive) return
        // 토큰이 끝났으면 화면마다 따로 처리하지 않고 여기서 로그인으로 보낸다
        if (error.code === 'UNAUTHORIZED') return navigate('/login', { replace: true })
        setState({ data: null, error, loading: false })
      })
    return () => {
      alive = false
    }
  }, [load, nonce, navigate])

  return { ...state, reload, setData: (data) => setState((prev) => ({ ...prev, data })) }
}
