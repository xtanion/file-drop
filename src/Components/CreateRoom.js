import { Card, CardContent, Typography, styled } from "@mui/joy";
import React, { useCallback } from "react";

const CreateRoom = props => {
    const { setRoom } = props;
    return (
        <Card varient="soft" >
            <div>
                <Typography level="title-lg">Create/Join Room</Typography>
            </div>
            <CardContent>
                <Typography></Typography>
            </CardContent>
        </Card >
    );
}

export default CreateRoom;