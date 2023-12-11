
import Card from '../../shared/components/UIElements/Card';
import classes from './PlaceItem.module.css';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import { useState, useContext } from 'react';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';

const PlaceItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openMapHandler = () => setShowMap(true);

  const closeMapHandler = () => setShowMap(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  }

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  }

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/${props.id}`,
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token // Tenemos que agregar el string Bearer para identificar este tipo de autorizacion
        }
      );
      props.onDelete(props.id);

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Modal 
        show={showMap} 
        onClose={closeMapHandler} 
        header={props.address} 
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
        >
        <div className={classes['map-container']}>
          <h2>The map!</h2>
        </div>
      </Modal>
      <Modal 
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header={'Are you sure?'}
        footerClass="place-item__modal-actions"
        footer={
          <>
            <Button inverse onClick={cancelDeleteHandler}>CANCEL</Button>
            <Button danger onClick={confirmDeleteHandler}>DELETE</Button>
          </>
        }
      >
        <p>Do you want to proceed and delete this place? Please note that it can't be undone thereafter</p>
      </Modal>
      <li className="place-item">
        <Card className={classes["place-item__content"]}>
          {isLoading && <LoadingSpinner asOverlay/>}
          <div className={classes["place-item__image"]}>
            <img src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`} alt={props.title} />
          </div>
          <div className={classes["place-item__info"]}>
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className={classes["place-item__actions"]}>
            <Button inverse onClick={openMapHandler}>VIEW ON MAP</Button>
            {auth.userId === props.creatorId &&
            <>
              <Button to={`/places/${props.id}`}>EDIT</Button>
              <Button danger onClick={showDeleteWarningHandler}>DELETE</Button>
            </>
            }
          </div>
        </Card>
      </li>
    </>
  );
};

export default PlaceItem;