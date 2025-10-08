import React, { CSSProperties, useEffect, useState } from "react";
import { Modal } from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import messageService from "../../../shared/api/services/messageService";
import { MessageEditVm } from "../../../models/IMessage";
import { useCurrentUserId } from "../../../shared/api/services/loader/currentUserLoader";
import { ActionButton } from "../ActionButton/ActionButton";

interface FavoriteHookProps {
  message?: MessageEditVm;
  onFavoriteChange: () => void;
  style?: CSSProperties;
  children?: React.ReactNode;
  title?: string;
}

export const FavoriteHook: React.FC<FavoriteHookProps> = ({
  message,
  onFavoriteChange,
  style,
  children,
  title,
}) => {
  const currentUserId = useCurrentUserId();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"add" | "remove" | null>(null);

  useEffect(() => {
    if (message) {
      if (
        message.favoriteUserIds?.some(
          (o) => o === (currentUserId.toString() ?? "0")
        )
      ) {
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }
    }
  }, [message, currentUserId]);

  const showConfirmationModal = (action: "add" | "remove") => {
    setActionType(action);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (actionType && message) {
      if (actionType === "add") {
        await markAsFavorite();
      } else if (actionType === "remove") {
        await removeFavorite();
      }
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const markAsFavorite = async () => {
    if (message) {
      await messageService.updateFavorite(message);
      onFavoriteChange();
    }
  };

  const removeFavorite = async () => {
    if (message) {
      await messageService.removeFavorite(message.id ?? "0");
      onFavoriteChange();
    }
  };

  return (
    <div>
      {isFavorite ? (
        <ActionButton
          icon={<StarFilled style={{ color: "yellow" }} />}
          onClick={() => showConfirmationModal("remove")}
          style={{ ...style }}
          title={title}
        />
      ) : (
        <ActionButton
          icon={<StarOutlined />}
          onClick={() => showConfirmationModal("add")}
          style={{ ...style }}
          title={title}
        />
      )}

      <Modal
        title="TeamOne"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Ja"
        cancelText="Nein"
      >
        {actionType === "add" ? "Als Favorit makieren" : "Als Favorit entferen"}
        ?
      </Modal>
    </div>
  );
};
