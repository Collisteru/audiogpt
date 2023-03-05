import * as React from "react"
import { Svg, Defs, Mask, RadialGradient, Stop, Rect, Path} from 'react-native-svg';

const SvgComponent = (props) => (
  <Svg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <Defs>
      <RadialGradient id="a">
        <Stop
          offset="70%"
          style={{
            stopColor: "#fff",
            stopOpacity: 1,
          }}
        />
        <Stop
          offset="100%"
          style={{
            stopColor: "#fff",
            stopOpacity: 0,
          }}
        />
      </RadialGradient>
      <Mask id="b" />
    </Defs>
    <Path fill="url(#a)" mask="url(#b)" d="M0 0h100v100H0z" />
  </Svg>
)

export default SvgComponent