import moment from "moment-timezone";
import { useEffect, useState } from "react";

const CountUp = (props) => {
  const [timer, setTimer] = useState();
  useEffect(() => {
    const start = props.start;
    setInterval(() => {
      const now = () => moment();
      const diff = now().diff(start);
      setTimer(
        moment.utc(moment.duration(diff).asMilliseconds()).format("HH:mm:ss")
      );
    }, 1000);
    clearInterval();
  }, [props.start]);

  return (
    <div style={{ ...props.style }}>
      {moment
        .utc(moment.duration(moment().diff(props.start)).asMilliseconds())
        .format("HH:mm:ss")}
    </div>
  );
};

export default CountUp;
