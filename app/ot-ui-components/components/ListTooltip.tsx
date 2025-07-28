import React from "react";
import Paper from "@material-ui/core/Paper/index.js";
import List from "@material-ui/core/List/index.js";
import ListItem from "@material-ui/core/ListItem/index.js";
import ListItemText from "@material-ui/core/ListItemText/index.js";
import Popper, { PopperProps } from "@material-ui/core/Popper/index.js";
import Fade from "@material-ui/core/Fade/index.js";
import { makeStyles } from "@material-ui/core/styles/index.js";

const useStyles = makeStyles({
  listitem: {
    padding: "0.2rem 0.6rem",
    width: "100%",
  },
  listitemtext: {
    fontSize: "0.75rem",
    minWidth: "100%",
  },
});

const ListTooltip = ({
  dataList,
  open,
  anchorEl,
  container,
}: {
  dataList: { label: string; value: string }[];
  open: boolean;
  anchorEl: PopperProps["anchorEl"];
  container: PopperProps["container"];
}) => {
  const classes = useStyles();
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      container={container}
      transition
      placement="top"
      modifiers={{
        preventOverflow: {
          enabled: true,
          boundariesElement: "window",
        },
      }}
      style={{
        zIndex: 2,
      }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper>
            <List dense>
              {dataList.map((d, i) => (
                <ListItem key={i} className={classes.listitem}>
                  <ListItemText
                    primary={d.label}
                    secondary={d.value}
                    className={classes.listitemtext}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default ListTooltip;
