import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { Autocomplete } from '@material-ui/lab';
import { 
  Delete,
  Add, 
} from '@material-ui/icons';
import {
  List,
  ListItem,
  ListItemText,
  Grid,
  Typography,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Box,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  TextField,
} from '@material-ui/core';

import { tableIcons } from '../../../util';
import axiosInstance from '../../../axiosApi';

const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
  list: {

    overflow: 'auto',
  },
  classInfo: {
    height: 300,
    maxHeight: 300,
  },
}));


export default function ManagePreschool(props) {
  const styleClasses = useStyles();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [classesMap, setClassesMap] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [addStudent, setAddStudent] = useState(null);
  const [toClass, setToClass] = useState(null);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);

  useEffect(() => {
    getClasses();
    getAvailableStudents();
  }, []);

  const refreshData = () => {
    getClasses();
    getAvailableStudents();
  }

  const getClasses = async () => {
    let response = await axiosInstance.get(`/yoyaku/preschool-info/`);
    const classesMap = new Map();
    for (let d of response.data) {
      const classSizeResponse = await axiosInstance.get(`/yoyaku/preschool-info/${d.id}/class_size/`);
      d.size = classSizeResponse.data;
      const studentList = await axiosInstance.get(`/yoyaku/preschool-info/${d.id}/student_list/`);
      classesMap.set(d.id, studentList.data);
    }
    response.data.sort((a, b) => a.id - b.id);
    setClassesMap(classesMap);
    setClasses(response.data);
    setLoading(false);
  }

  const getAvailableStudents = async () => {
    let response = await axiosInstance.get(`/yoyaku/users/student_not_preschool_list/`);
    setAvailableStudents(response.data);
  }

  const addStudentToClass = async (classId, studentId) => {
    const response = await axiosInstance.post(`/yoyaku/preschool-info/${classId}/add_student/`, {student_profile: studentId});
    return response;
  }

  const removeStudentFromClass = async (studentId) => {
    const response = await axiosInstance.post(`/yoyaku/preschool-info/${studentId}/remove_student/`);
    return response;
  }

  return(
    <div>
      <div className={styleClasses.sectionEnd}>
        <MaterialTable 
          title='未就学児クラスの時間割'
          data={classes}
          isLoading={loading}
          icons={tableIcons}
          options={{
            sorting: false,
            search: false,
          }}
          localization={{
            pagination: {
              labelDisplayedRows: '{count}の{from}-{to}',
              labelRowsSelect: '行',
            },
            toolbar: {
              nRowsSelected: '{0}行を選択',
            },
            header: {
              actions: 'アクション',
            },
            body: {
              emptyDataSourceMessage: '未就学児のデータがありません',
              deleteTooltip: '削除',
              addTooltip: '追加',
              editTooltip: '編集',
              editRow: {
                deleteText: '削除を確認しますか？'
              },
            },
          }}
          columns={[
            {title: 'ID', field: 'id', hidden: true},
            {title: '情報', field: 'name'},
            {title: 'コメント', field: 'comment'},
            {title: '最大人数', field: 'limit', type: 'numeric'},
          ]}
          editable={{
            onRowAdd: newData => axiosInstance.post(`/yoyaku/preschool-info/`, newData).then(() => setLoading(true)).then(refreshData),
            onRowUpdate: newData => axiosInstance.put(`/yoyaku/preschool-info/${newData.id}/`, newData).then(() => setLoading(true)).then(refreshData),
            onRowDelete: oldData => axiosInstance.delete(`/yoyaku/preschool-info/${oldData.id}/`).then(() => setLoading(true)).then(refreshData),
          }}
        />
      </div>
      {loading ? 
        null : 
        <Grid container spacing={4}>
          <Dialog 
            open={addStudentDialogOpen} 
            onClose={() => {
              setAddStudentDialogOpen(false);
              setAddStudent(null);
              setToClass(null);
            }}
          >
            <DialogTitle>生徒を追加する</DialogTitle>
            <DialogContent>
              <Autocomplete
                className={styleClasses.sectionEnd}
                id='toClass'
                name='toClass'
                options={classes}
                getOptionLabel={c => c.name}
                onChange={(event, value) => {
                  setToClass(value.id);
                }}
                renderInput={(params) => <TextField {...params} label="時間" />}
                disableClearable
              />
              <Autocomplete
                id='addStudent'
                name='addStudent'
                options={availableStudents}
                getOptionLabel={student => `${student.last_name}, ${student.first_name}`}
                onChange={(event, value) => {
                  setAddStudent(value.student_profile.id);
                }}
                renderInput={(params) => <TextField {...params} label="生徒" />}
                disableClearable
              />
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                onClick={() => {
                  addStudentToClass(toClass, addStudent).then(() => setLoading(true)).then(refreshData);
                  setAddStudent(null);
                  setToClass(null);
                  setAddStudentDialogOpen(false);
                }}
              >
                追加する
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  setAddStudent(null);
                  setToClass(null);
                  setAddStudentDialogOpen(false);
                }}
              >
                キャンセル
              </Button>
            </DialogActions>
          </Dialog>
          {classes.map(c => 
            <Grid item xs={12} sm={6}>
              <Paper elevation={24} className={styleClasses.classInfo}>
                <Box p={3}>
                  <Typography>{`${c.name} - ${c.size}人`}</Typography>
                  <Typography color='textSecondary' variant='subtitle1'>{c.comment}</Typography>
                  <IconButton edge="end" onClick={() => setAddStudentDialogOpen(true)}>
                    <Add />
                  </IconButton>
                  <List dense className={styleClasses.list}>
                    {classesMap.get(c.id).map(student => 
                      <div>
                      <ListItem>
                        <ListItemText 
                          primary={`${student.last_name}, ${student.first_name}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end"
                            onClick={() => {
                              removeStudentFromClass(student.student_profile.id).then(() => setLoading(true)).then(refreshData);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                      </div>
                    )}
                  </List>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      }
    </div>
  );
}