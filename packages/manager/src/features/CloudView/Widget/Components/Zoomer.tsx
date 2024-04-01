import * as React from 'react';
import ZoomOutMap from '@mui/icons-material/ZoomOutMap'
import ZoomInMap from '@mui/icons-material/ZoomInMap'


export const ZoomIcon = (props:any) => {


    const[zoomIn, setZoomIn] = React.useState<boolean>(props.zoomIn)


    const handleClick = () => {
        setZoomIn((zoomIn) => !zoomIn);        
    }

    React.useEffect(() => {
        props.handleZoomToggle(zoomIn);
    }, [zoomIn])
    

    if(zoomIn) {
        return (
            <ZoomInMap onClick={handleClick} className='zoomInMap' style={props.componentStyle}/>
        )
    }

    return (            
        <ZoomOutMap onClick={handleClick} className='zoomOutMap' style={props.componentStyle}/>
    )
}

