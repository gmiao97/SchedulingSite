import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {  
  Grid,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link as MaterialLink,
  Button,
} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 500,
  },
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
  printout: {
    width: '100%',
    border: 0,
    height: 300,
  },
}));


export default function ClassInfo(props) {
  const classes = useStyles();

  const createData = (name, link, meetingId, password) => ({name, link, meetingId, password});
  const rows = [
    createData('通常フリーレッスン（月～金）', 'https://us04web.zoom.us/j/77084078128?pwd=bFJJeEFEa0ZoTlhTZm9za3VZT2sxdz09', '770 8407 8128', '9191'),
    createData('フリーレッスン中学生', 'https://us04web.zoom.us/j/79279262394?pwd=L3ZrTFFhR0QrazVhM2ZzeHQ3b2FHQT09', '792 7926 2394', '9191'),
    createData('初心者クラス', 'https://us02web.zoom.us/j/83515032396?pwd=dkNIeWI5QTVaU3JxL1h2TXYwa0xzUT09', '835 1503 2396', '121212'),
  ];
  if (props.currentUser.user_type !== 'STUDENT' || props.currentProduct.name.includes('未就学児')) {
    rows.push(createData('未就学児クラス', 'https://us04web.zoom.us/j/73536479876?pwd=M1J0d09KWWRaZFIrYzgxd3lvL0oxZz09', '735 3647 9876', '1231'));
  }
  if (props.currentUser.user_type !== 'STUDENT' || props.currentProduct.name.includes('土日')) {
    rows.push(createData('土日クラス', 'https://us04web.zoom.us/j/73872618641?pwd=Qm5oVWpOdGorUlZ2bS8rY29WS2xzdz09', '738 7261 8641', '9876'));
  } 

  const rules = [
    'ZOOMの名前を、自分の名前に設定しましょう。',
    '参加するときは、ビデオをオンにしましょう。',
    '見学のときは、名前を『見学・○○（なまえ）』に変えましょう。',
    '先生の許可なしに、お話をするのはやめましょう。',
    '他のお友達の迷惑になるような事は、やめましょう。注意してもやめないときは、退出してもらう場合があります。',
  ];

  return(
    <div>
      <Typography variant='h6' display='block' gutterBottom>クラスのルール</Typography>
      {rules.map(line => 
        <Typography variant='body1' color='textSecondary'>{line}</Typography>
      )}
      <Typography display='block' variant='caption' color='textSecondary' gutterBottom>何かご事情がある場合は保護者の方からご相談下さい。info@mercy-education.com</Typography>
      <Button variant='outlined' className={classes.sectionEnd} color='secondary' href='http://mercy-education.com/FREE/cn2/2020-08-17.html' 
      target='_blank' rel='noopener noreferrer'>
        時間割り
      </Button>
      <Typography variant='h6' display='block'>ZOOM ID</Typography>
      <TableContainer component={Paper} elevation={24} className={classes.sectionEnd}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>レッスン</TableCell>
              <TableCell>リンク</TableCell>
              <TableCell>ミーティングID</TableCell>
              <TableCell>パスワード</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row =>
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>
                  <MaterialLink href={row.link} target='_blank' rel='noopener noreferrer' color='secondary'>
                    参加する
                  </MaterialLink>
                </TableCell>
                <TableCell>{row.meetingId}</TableCell>
                <TableCell>{row.password}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant='h6' display='block'>プリント</Typography>
      <Paper elevation={24}>
        <Box p={3}>
          <iframe className={classes.printout} src="https://drive.google.com/embeddedfolderview?id=1EMhq3GkTEfsk5NiSHpqyZjS4H2N_aSak#list" />
        </Box>
      </Paper>
    </div>
  );
}