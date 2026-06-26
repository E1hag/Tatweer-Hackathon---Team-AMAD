import EmptyState from '../components/common/EmptyState';

export default function CreateRequestScreen() {
  return (
    <EmptyState
      title="Create request coming next"
      message="This screen will capture a resident need without building full auth yet."
    />
  );
}
