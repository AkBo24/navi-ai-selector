import { Field, Form, Formik } from 'formik';
import type { Todo } from '../../services/api';
import { useAddTodoMutation, useGetTodosQuery } from '../../services/api';
import TodoView from './Todo';
import * as yup from 'yup';
import { Button, TextField } from '@mui/material';

const validationSchema = yup.object<Todo>({
    title: yup.string().required('Required Field'),
    description: yup.string().default(''),
    completed: yup.boolean().default(false),
});

const TodoList: React.FC = () => {
    const { data: todos } = useGetTodosQuery();
    const [addTodo] = useAddTodoMutation();
    const handleSubmit = async (values: Todo) => {
        await addTodo({
            title: values.title,
            description: '',
            completed: false,
        });
        console.log(values);
    };
    return (
        <>
            <Formik
                validationSchema={validationSchema}
                initialValues={{ title: '', description: '', completed: false }}
                onSubmit={handleSubmit}>
                {({ errors, touched }) => (
                    <Form>
                        {/* Title Field */}
                        <Field name='title'>
                            {({ field }: any) => (
                                <TextField
                                    {...field}
                                    label='Title'
                                    size='small'
                                    error={touched.title && Boolean(errors.title)}
                                    helperText={touched.title && errors.title}
                                    fullWidth
                                />
                            )}
                        </Field>

                        {/* Submit Button */}
                        <Button type='submit' variant='contained' fullWidth>
                            Submit
                        </Button>
                    </Form>
                )}
            </Formik>

            {todos?.map((todo) => (
                <TodoView todo={todo} key={todo.id} />
            ))}
        </>
    );
};
export default TodoList;
