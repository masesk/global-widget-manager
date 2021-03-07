import React, { useState } from 'react';
import '../css/App.css';
import Window from './Window'
import Header from './Header'
import * as R from 'ramda'
import useDynamicRefs from 'use-dynamic-refs';
import AddWidget from './AddWidget'

const Widget = () => {
  const [windows, setWindows] = useState({})
  const [getRef, setRef] =  useDynamicRefs();


  const updateWindow = (id, title, url) => {
    if(R.isEmpty(id) || R.isEmpty(title) || R.isEmpty(url)){
      return
    }
    setWindows(R.assoc(id, {
      id: id,
      title: title,
      width: 800,
      height: 500,
      url: url,
    }, windows))

  }


  const addWidgetWindow = {
    id: "addwidget",
    title: "Add Widget",
    width: 800,
    height: 500
  }

  const clickCallback = (id) => {
    const selectedRef = getRef(id)
    R.forEach(key => {
      const keyRef = getRef(key)
      if(R.isNil(R.path(["current", "style"], keyRef))){
        return
      }
      if(key === id){
        keyRef.current.style.zIndex = 1;
      }
      else{
        keyRef.current.style.zIndex = 0;
      }
    }, R.append(addWidgetWindow.id, R.keys(windows)))
  }




  return (

    <>
      <Header />
      <Window initTitle={addWidgetWindow.title}
        id={addWidgetWindow.id}
        initWidth={addWidgetWindow.width} ref={setRef(addWidgetWindow.id)} 
        initHeight={addWidgetWindow.height}
        clickCallback={clickCallback}>
        <AddWidget updateWindow={updateWindow}/>
      </Window>
      {
        R.compose(
          R.map(([key, windowKey]) => {
            const window = R.prop(windowKey, windows)
            return <Window ref={setRef(windowKey)} key={key} 
              id={window.id}
              initComponent={window.component} initTitle={window.title}
              initUrl={window.url} initWidth={window.width} clickCallback={clickCallback}
              initHeight={window.height} />
          }),
          R.toPairs,
        )(R.keys(windows))
      }


    </>
  );
}

export default React.forwardRef(Widget);

