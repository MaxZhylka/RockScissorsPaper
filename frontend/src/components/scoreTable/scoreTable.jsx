import React from "react";
import { useSelector } from "react-redux";

const ScoreTable=()=>
{
    const game = useSelector(state=>state.game);
    return(<div>
        {game};
    </div>)
}
export default ScoreTable;