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
    height: 400,
  },
  timetable: {
    width: '100%',
    border: 0,
    height: 200,
  }
}));


export default function ClassInfo(props) {
  const classes = useStyles();

  const showContent = props.currentUser.user_type !== 'STUDENT' || props.currentUser.stripeSubscriptionProvision;

  const createData = (name, link, meetingId, password) => ({name, link, meetingId, password});
  let rows = [];
  if (showContent) {
    rows = rows.concat([
      createData('通常フリーレッスン（月～金）', 'https://us04web.zoom.us/j/73764547990?pwd=bCtnOUlNRjNsamloNDNKZHE2c2pBdz09', '737 6454 7990', '9090'),
      createData('フリーレッスン中学生', 'https://us04web.zoom.us/j/79057541307?pwd=K3BrMzFYSkxsRlZadUM2dFdFWUROdz09', '790 5754 1307', '9090'),
      createData('初心者クラス', 'https://us02web.zoom.us/j/83515032396?pwd=dkNIeWI5QTVaU3JxL1h2TXYwa0xzUT09', '835 1503 2396', '121212'),
    ]);
    if (props.currentUser.user_type !== 'STUDENT' || props.currentProduct.name.includes('未就学児')) {
      rows.push(createData('未就学児クラス', 'https://us04web.zoom.us/j/72820034193?pwd=Y2U3T2xEM1dMRzd3ZThGaE9mUVN1QT09', '728 2003 4193', '9090'));
    }
    if (props.currentUser.user_type !== 'STUDENT' || props.currentProduct.name.includes('土日')) {
      rows.push(createData('土日クラス', 'https://us04web.zoom.us/j/76783951896?pwd=WmZONURnL3dUeDNYSVY3RmFwSlVUQT09', '767 8395 1896', '9090'));
    }
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
      <Typography variant='h6' display='block' color='primary' gutterBottom>クラスのルール</Typography>
      {rules.map(line => 
        <Typography key={line} variant='body1' color='textSecondary'>{line}</Typography>
      )}
      <Typography display='block' variant='caption' color='textSecondary' gutterBottom>何かご事情がある場合は保護者の方からご相談下さい。info@mercy-education.com</Typography>
      <Typography variant='h6' display='block' color='primary' gutterBottom>時間割り</Typography>
      <Paper elevation={24}>
        <Box p={3}>
          <iframe className={classes.timetable} src="https://drive.google.com/embeddedfolderview?id=1z5WUmx_lFVRy3YbmtEUH-tIqrwsaP8au#list">
            <Button variant='contained' className={classes.sectionEnd} color='secondary' href='https://drive.google.com/drive/u/0/folders/1z5WUmx_lFVRy3YbmtEUH-tIqrwsaP8au' 
            target='_blank' rel='noopener noreferrer'>
              時間割り
            </Button>
          </iframe>
        </Box>
      </Paper>
      <Typography variant='h6' display='block' color='primary'>ZOOM ID</Typography>
      <Typography variant='subtitle1' display='block' color='primary'>日本時間　11月2日～12月1日</Typography>
      <Typography variant='subtitle1' display='block' color='primary'>アメリカ　11月1日～11月末日</Typography>
      {showContent ? 
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
        </TableContainer> :
        <Typography display='block'>サブスクリプションありません</Typography>
      }
      <Typography variant='h6' display='block' color='primary'>プリント</Typography>
      <Paper elevation={24}>
        <Box p={3}>
          {showContent ? 
            <iframe className={classes.printout} src="https://drive.google.com/embeddedfolderview?id=1EMhq3GkTEfsk5NiSHpqyZjS4H2N_aSak#list">
              <Button variant='outlined' className={classes.sectionEnd} color='secondary' target='_blank' rel='noopener noreferrer'
              href='https://drive.google.com/drive/folders/1EMhq3GkTEfsk5NiSHpqyZjS4H2N_aSak?usp=sharing'>
                Googleドライブへ
              </Button>
            </iframe> :
            <Typography display='block'>サブスクリプションありません</Typography>
          }
        </Box>
      </Paper>
    </div>
  );
}