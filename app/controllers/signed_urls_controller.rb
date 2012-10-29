class SignedUrlsController < ApplicationController
  def index
    render json: {
      policy: s3_upload_policy_document,
      signature: s3_upload_signature,
      key: "uploads/#{Time.now.strftime("%Y%m%d%s")}/#{params[:doc][:title]}",
      success_action_redirect: "/"
    }
  end

  private
  
  # generate the policy document that amazon is expecting.
  # { bucket: ENV['S3_BUCKET'] },
  def s3_upload_policy_document
    Base64.encode64(
      {
        expiration: 30.minutes.from_now.utc.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
        conditions: [
          { bucket: 'truecount-localhost' },
          { acl: 'public-read' },
          ["starts-with", "$key", "uploads/"],
          { success_action_status: '201' }
        ]
      }.to_json
    ).gsub(/\n|\r/, '')
  end
  
  # sign our request by Base64 encoding the policy document.
  # ENV['AWS_SECRET_KEY_ID'],
  def s3_upload_signature
    Base64.encode64(
      OpenSSL::HMAC.digest(
        OpenSSL::Digest::Digest.new('sha1'),
        '7xZWucOQ9R9+51Mpgjx5P5K0bfHvqVxxRP2UWTP6',
        s3_upload_policy_document
      )
    ).gsub(/\n/, '')
  end
end
