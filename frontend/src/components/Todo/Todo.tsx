import { Box, Checkbox, Typography } from '@mui/material';
import { useUpdateTodoMutation, type Todo as TodoView } from '../../services/api';

const TodoView: React.FC<{ todo: TodoView }> = ({ todo }) => {
    const [updateTodo] = useUpdateTodoMutation();
    const { completed } = todo;
    return (
        <Box
            sx={{ backgroundColor: completed ? 'gray' : 'wheat' }}
            padding={1}
            borderRadius={2}
            display='flex'>
            <Checkbox
                checked={todo.completed}
                onClick={() =>
                    updateTodo({
                        ...todo,
                        completed: !todo.completed,
                    })
                }
            />
            <Box>
                <Typography
                    variant='h5'
                    sx={{ textDecoration: completed ? 'line-through' : '' }}>
                    {todo.title}
                </Typography>
                <Typography
                    variant='body2'
                    sx={{ textDecoration: completed ? 'line-through' : '' }}>
                    {todo.description}
                </Typography>
            </Box>
        </Box>
    );
};

export default TodoView;
