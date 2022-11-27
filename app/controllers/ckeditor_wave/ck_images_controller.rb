module CkeditorWave
  class CkImagesController < ApplicationController
    skip_before_action :verify_authenticity_token

    def create
      ck_image = CkImage.new(ck_image: params[:ck_image], uuid: SecureRandom.uuid)

      if ck_image.save
        render json: ck_image.url
      else
        head 500
      end
    end
    
    def destroy
      CkImage.where(uuid: parmas[:id]).destroy
      head 200
    end
  end
end
