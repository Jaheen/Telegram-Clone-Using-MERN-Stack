import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneIcon from "@mui/icons-material/Done";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Fab from "@mui/material/Fab";
import Drawer from "@mui/material/Drawer"
import { useEffect, useState } from "react";
import useAppTheme from "hooks/useAppTheme";
import useBackStack from "hooks/useBackStack";
import { useNavigate } from "react-router-dom";
import AvatarPicker from "components/common/AvatarPicker";
import { useDispatch } from "react-redux";
import { ChatsReducerThunks } from "store/chats-reducer";
import "./styles.scss"


export default function EditGroupDrawer(props) {

    const { open, onClose, targetGroup } = props

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { theme } = useAppTheme()
    const backstack = useBackStack()
    const [groupInfo, setGroupInfo] = useState({
        groupName: targetGroup.groupName,
        groupDescription: targetGroup.groupDescription,
        avatarUrl: targetGroup.avatarUrl
    })

    useEffect(() => {
        if (open) {
            backstack.push("edit-group-drawer", () => onClose())
        }

        // eslint-disable-next-line
    }, [open])

    /**
     * Check if group data is changed or not
     */
    const isDataChanged = (() => {
        let isChanged = false
        const fieldsToCheck = ["groupName", "groupDescription", "avatarUrl"]

        fieldsToCheck.forEach(fieldName => {
            if (targetGroup[fieldName])
                isChanged = isChanged || targetGroup[fieldName] !== groupInfo[fieldName]
            else
                isChanged = isChanged || groupInfo[fieldName] !== ""
        })

        isChanged = isChanged && groupInfo.groupName.trim() !== ""

        return isChanged
    })()

    const fabClass = isDataChanged ? "slide-up" : null
    const { groupName, groupDescription, avatarUrl } = groupInfo

    return (
        <Drawer id="edit-group-drawer" className={`mainbar-drawer theme-${theme}`} open={open} onClose={() => navigate(-1)} anchor="right">
            <div className="header">
                <IconButton className={`theme-${theme}`} onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <h1 className="header__title">Edit Group</h1>
            </div>

            <div className="scrollable-content">
                <AvatarPicker avatarUrl={avatarUrl} avatarText={groupName.substring(0, 1)}
                    targetFolder="groups" onChange={(avatarUrl) => setGroupInfo({ ...groupInfo, avatarUrl })} />

                <TextField className={`form-field theme-${theme}`} label="Group Name"
                    value={groupName} onChange={(ev) => setGroupInfo({ ...groupInfo, groupName: ev.target.value })} />

                <TextField className={`form-field theme-${theme}`} multiline maxRows={4} label="Group Description (optional)"
                    value={groupDescription} onChange={(ev) => setGroupInfo({ ...groupInfo, groupDescription: ev.target.value })} />
            </div>

            <Fab className={`fab-bottom-right ${fabClass} theme-${theme}`}
                onClick={() => dispatch(ChatsReducerThunks.updateGroupProfile({ groupName, groupDescription, avatarUrl }))}>
                <DoneIcon />
            </Fab>
        </Drawer>
    )
}